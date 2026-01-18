import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Toggle } from '@/components/common/Toggle';
import { User, Bell, Shield, Palette, Globe, Database, Save } from 'lucide-react';
import { toast } from 'sonner';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    // Profile
    name: 'Vikram Roy',
    email: 'vikram.roy@dekhoexam.com',
    phone: '+91 54321 09876',
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: true,
    newUserAlert: true,
    paymentAlert: true,
    // Security
    twoFactor: false,
    sessionTimeout: 30,
    // General
    language: 'en',
    timezone: 'Asia/Kolkata',
    freeTestsLimit: 2,
    autoApprovePayments: true,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'general', label: 'General', icon: Globe },
  ];

  return (
    <DashboardLayout 
      title="Settings" 
      breadcrumbs={[{ label: 'Settings' }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="dashboard-card p-2 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 dashboard-card p-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="section-title mb-4">Profile Information</h3>
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">VR</span>
                  </div>
                  <div>
                    <button className="btn-outline text-sm">Change Photo</button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG up to 2MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <input
                    type="text"
                    value="Administrator"
                    disabled
                    className="input-field bg-muted"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="section-title">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Toggle
                    checked={settings.emailNotifications}
                    onChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                  </div>
                  <Toggle
                    checked={settings.pushNotifications}
                    onChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">Weekly Report</p>
                    <p className="text-sm text-muted-foreground">Receive weekly analytics report</p>
                  </div>
                  <Toggle
                    checked={settings.weeklyReport}
                    onChange={(checked) => setSettings({ ...settings, weeklyReport: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">New User Alert</p>
                    <p className="text-sm text-muted-foreground">Get notified when new users register</p>
                  </div>
                  <Toggle
                    checked={settings.newUserAlert}
                    onChange={(checked) => setSettings({ ...settings, newUserAlert: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">Payment Alert</p>
                    <p className="text-sm text-muted-foreground">Get notified for new payments</p>
                  </div>
                  <Toggle
                    checked={settings.paymentAlert}
                    onChange={(checked) => setSettings({ ...settings, paymentAlert: checked })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="section-title">Security Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Toggle
                    checked={settings.twoFactor}
                    onChange={(checked) => setSettings({ ...settings, twoFactor: checked })}
                  />
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">Session Timeout</p>
                      <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                    </div>
                  </div>
                  <select
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                    className="input-field w-48"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg">
                  <p className="font-medium text-destructive">Danger Zone</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    These actions are irreversible
                  </p>
                  <div className="flex gap-3">
                    <button className="btn-outline text-sm">Change Password</button>
                    <button className="btn-danger text-sm">Delete Account</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="section-title">General Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="input-field"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="input-field"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="font-medium mb-4">Platform Settings</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">Free Tests Limit</p>
                        <p className="text-sm text-muted-foreground">
                          Number of free tests per user
                        </p>
                      </div>
                    </div>
                    <input
                      type="number"
                      value={settings.freeTestsLimit}
                      onChange={(e) => setSettings({ ...settings, freeTestsLimit: parseInt(e.target.value) })}
                      className="input-field w-24"
                      min={0}
                      max={10}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">Auto-approve Payments</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically activate subscriptions after payment
                      </p>
                    </div>
                    <Toggle
                      checked={settings.autoApprovePayments}
                      onChange={(checked) => setSettings({ ...settings, autoApprovePayments: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6 mt-6 border-t border-border">
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
