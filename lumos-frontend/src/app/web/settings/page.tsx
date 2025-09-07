// Settings Page
"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Volume2,
  Moon,
  Sun,
  Save,
  Edit,
  Settings,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState({
    name: profile?.name || '',
    email: user?.email || '',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    appearance: {
      theme: 'light',
      fontSize: 'medium'
    },
    language: 'English',
    sound: {
      enabled: true,
      volume: 80
    }
  });

  const handleSave = async () => {
    // TODO: Implement save functionality
    setIsEditing(false);
    console.log('Settings saved:', settings);
  };

  const handleCancel = () => {
    setSettings({
      name: profile?.name || '',
      email: user?.email || '',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      appearance: {
        theme: 'light',
        fontSize: 'medium'
      },
      language: 'English',
      sound: {
        enabled: true,
        volume: 80
      }
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 relative">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-orange-200/30 blur-2xl" />
        <div className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-pink-200/30 blur-2xl" />
        <div className="absolute top-1/2 left-1/3 h-24 w-24 rounded-full bg-yellow-200/30 blur-xl" />
        <div className="absolute top-1/3 right-1/4 h-20 w-20 rounded-full bg-purple-200/30 blur-xl" />
      </div>

      <div className="relative max-w-4xl mx-auto p-6">
        {/* Header with back button */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/web/dashboard/student"
              className="flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-2 text-sm font-medium text-orange-700 shadow-sm hover:bg-orange-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and settings</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Learning Preferences */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-orange-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">Learning Preferences</h2>
              </div>
              <Link
                href="/web/settings/preferences"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                <span>Customize</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-gray-600 text-sm">
              Personalize your Lumos experience with your learning style, academic level, and communication preferences.
            </p>
          </div>

          {/* Profile Settings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-orange-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2 px-3 py-1 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Notification Settings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-orange-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: e.target.checked }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive browser notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: e.target.checked }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-600">Receive updates via SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, sms: e.target.checked }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-orange-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Palette className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, theme: 'light' } }))}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      settings.appearance.theme === 'light'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </button>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, theme: 'dark' } }))}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                      settings.appearance.theme === 'dark'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                <select
                  value={settings.appearance.fontSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, appearance: { ...prev.appearance, fontSize: e.target.value } }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sound Settings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-orange-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Volume2 className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Sound & Audio</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Enable Sound</p>
                  <p className="text-sm text-gray-600">Play sounds for notifications and interactions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.sound.enabled}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      sound: { ...prev.sound, enabled: e.target.checked }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.sound.volume}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    sound: { ...prev.sound, volume: parseInt(e.target.value) }
                  }))}
                  disabled={!settings.sound.enabled}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>{settings.sound.volume}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Language Settings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-orange-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Language</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Interface Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="English">English</option>
                <option value="Bahasa Malaysia">Bahasa Malaysia</option>
                <option value="Mandarin">Mandarin</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-orange-200/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Privacy & Security</h2>
            </div>

            <div className="space-y-4">
              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <p className="font-medium text-gray-900">Change Password</p>
                <p className="text-sm text-gray-600">Update your account password</p>
              </button>
              
              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </button>
              
              <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <p className="font-medium text-gray-900">Data & Privacy</p>
                <p className="text-sm text-gray-600">Manage your data and privacy settings</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
