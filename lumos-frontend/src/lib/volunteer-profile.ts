// lib/volunteer.ts
import { createClient } from '@supabase/supabase-js';

// ── Supabase client (browser)
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error('Missing Supabase env vars');
const supabase = createClient(url, key, {
  auth: {
    storage: typeof window !== 'undefined' ? {
      getItem: (key: string) => {
        try {
          return sessionStorage.getItem(key);
        } catch (error) {
          console.error('Error getting item from sessionStorage:', error);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          sessionStorage.setItem(key, value);
        } catch (error) {
          console.error('Error setting item in sessionStorage:', error);
        }
      },
      removeItem: (key: string) => {
        try {
          sessionStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing item from sessionStorage:', error);
        }
      }
    } : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

type VolunteerProfileInput = {
  fullName: string;
  phone?: string;
  skills: string[]; // e.g. ['Math','Science']
  availability?: any;
  experience?: string;
};

// ─────────────────────────────────────────────────────────────
// Use this after the user is signed in (recommended path)
export async function ensureVolunteerRoleAndProfile(input: VolunteerProfileInput) {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error('Not authenticated');

  // 1) set role (ignore if already exists)
  const { error: roleErr } = await supabase
    .from('user_roles')
    .insert({ user_id: user.id, role_id: 'volunteer' });
  if (roleErr && roleErr.code !== '23505') throw roleErr; // ignore unique violation

  // 2) upsert profile by user_id
  const { error: upsertErr } = await supabase
    .from('volunteer_profiles')
    .upsert(
      {
        user_id: user.id,
        full_name: input.fullName,
        phone: input.phone ?? null,
        skills: (input.skills ?? []).filter(Boolean),
        availability: input.availability ?? {},
        experience: input.experience ?? null,
      },
      { onConflict: 'user_id' }
    );

  if (upsertErr) throw upsertErr;
  return true;
}

// ─────────────────────────────────────────────────────────────
// Use this on the signup page (when you want to create profile immediately
// if the project returns a session; otherwise we stash and finish after login)
export async function signUpVolunteerAndCreateProfile(
  form: VolunteerProfileInput & { email: string; password: string }
) {
  const { data: signUp, error: signUpError } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    options: {
      // change '/web/login' if your sign-in route is different
      emailRedirectTo: `${window.location.origin}/web/login`,
    },
  });
  if (signUpError) throw signUpError;

  // If email confirm is ON, you won't have a session here
  if (!signUp.session || !signUp.user) {
    // cache what we need to create the profile later (after sign-in)
    localStorage.setItem(
      'pendingVolunteerProfile',
      JSON.stringify({
        full_name: form.fullName,
        phone: form.phone ?? null,
        skills: (form.skills ?? []).filter(Boolean),
        availability: form.availability ?? {},
        experience: form.experience ?? null,
      })
    );
    return { needsEmailConfirm: true };
  }

  // Session is available => create role + profile now
  const { error: roleErr } = await supabase
    .from('user_roles')
    .insert({ user_id: signUp.user.id, role_id: 'volunteer' });
  if (roleErr && roleErr.code !== '23505') throw roleErr;

  const { error: profErr } = await supabase.from('volunteer_profiles').insert({
    user_id: signUp.user.id,
    full_name: form.fullName,
    phone: form.phone ?? null,
    skills: (form.skills ?? []).filter(Boolean),
    availability: form.availability ?? {},
    experience: form.experience ?? null,
  });
  if (profErr) throw profErr;

  return { needsEmailConfirm: false };
}

// ─────────────────────────────────────────────────────────────
// Call this once on/after sign-in to finish the cached profile
export async function finishPendingVolunteerProfileIfAny() {
  const cached = localStorage.getItem('pendingVolunteerProfile');
  if (!cached) return false;

  const obj = JSON.parse(cached) as {
    full_name: string;
    phone: string | null;
    skills: string[];
    availability: any;
    experience: string | null;
  };

  await ensureVolunteerRoleAndProfile({
    fullName: obj.full_name,
    phone: obj.phone ?? undefined,
    skills: obj.skills ?? [],
    availability: obj.availability ?? {},
    experience: obj.experience ?? undefined,
  });

  localStorage.removeItem('pendingVolunteerProfile');
  return true;
}
