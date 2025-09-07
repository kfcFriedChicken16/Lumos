// lib/student.ts
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

type StudentProfileInput = {
  fullName: string;
  phone?: string;
  school?: string;
  subjects: string[]; // e.g. ['Math','Science']
  goals?: string;
};

// ─────────────────────────────────────────────────────────────
// Use this after the user is signed in (recommended path)
export async function ensureStudentRoleAndProfile(input: StudentProfileInput) {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error('Not authenticated');

  // 1) set role (ignore if already exists)
  const { error: roleErr } = await supabase
    .from('user_roles')
    .insert({ user_id: user.id, role_id: 'student' });
  if (roleErr && roleErr.code !== '23505') throw roleErr; // ignore unique violation

  // 2) upsert profile by user_id
  const { error: upsertErr } = await supabase
    .from('student_profiles')
    .upsert(
      {
        user_id: user.id,
        full_name: input.fullName,
        phone: input.phone ?? null,
        school: input.school ?? null,
        subjects: (input.subjects ?? []).filter(Boolean),
        goals: input.goals ?? null,
      },
      { onConflict: 'user_id' }
    );

  if (upsertErr) throw upsertErr;
  return true;
}

// ─────────────────────────────────────────────────────────────
// Use this on the signup page (when you want to create profile immediately
// if the project returns a session; otherwise we stash and finish after login)
export async function signUpStudentAndCreateProfile(
  form: StudentProfileInput & { email: string; password: string }
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
      'pendingStudentProfile',
      JSON.stringify({
        full_name: form.fullName,
        phone: form.phone ?? null,
        school: form.school ?? null,
        subjects: (form.subjects ?? []).filter(Boolean),
        goals: form.goals ?? null,
      })
    );
    return { needsEmailConfirm: true };
  }

  // Session is available => create role + profile now
  const { error: roleErr } = await supabase
    .from('user_roles')
    .insert({ user_id: signUp.user.id, role_id: 'student' });
  if (roleErr && roleErr.code !== '23505') throw roleErr;

  const { error: profErr } = await supabase.from('student_profiles').insert({
    user_id: signUp.user.id,
    full_name: form.fullName,
    phone: form.phone ?? null,
    school: form.school ?? null,
    subjects: (form.subjects ?? []).filter(Boolean),
    goals: form.goals ?? null,
  });
  if (profErr) throw profErr;

  return { needsEmailConfirm: false };
}

// ─────────────────────────────────────────────────────────────
// Call this once on/after sign-in to finish the cached profile
export async function finishPendingStudentProfileIfAny() {
  const cached = localStorage.getItem('pendingStudentProfile');
  if (!cached) return false;

  const obj = JSON.parse(cached) as {
    full_name: string;
    phone: string | null;
    school: string | null;
    subjects: string[];
    goals: string | null;
  };

  await ensureStudentRoleAndProfile({
    fullName: obj.full_name,
    phone: obj.phone ?? undefined,
    school: obj.school ?? undefined,
    subjects: obj.subjects ?? [],
    goals: obj.goals ?? undefined,
  });

  localStorage.removeItem('pendingStudentProfile');
  return true;
}
