import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Save } from "lucide-react";
import {
  useUpdatePassword,
  useUpdateProfile,
  useUpdateProfilePic,
} from "@/hooks/useAdminLogin";
import { toast } from "sonner";

interface UserInfo {
  id?: string;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  role?: string;
  avatar?: string | null;
}

export const Settings = () => {
  const { mutate: updateProfile, isLoading } = useUpdateProfile();
  const { mutate: updateProfilePic } = useUpdateProfilePic();
  const { mutate: updatePassword, isLoading: passwordLoading } =
    useUpdatePassword();

  const [user, setUser] = useState<UserInfo>({});
  const [settings, setSettings] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  /* 🔁 Load user from localStorage */
  const loadUserFromStorage = () => {
    try {
      const storedUser = JSON.parse(
        localStorage.getItem("user_info") || "{}",
      );

      setUser(storedUser);
      setSettings({
        name: storedUser?.name ?? "",
        email: storedUser?.email ?? "",
        phoneNumber: storedUser?.phoneNumber ?? "",
      });
    } catch {
      setUser({});
    }
  };

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const initials =
    settings.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  /* ✅ Save profile */
  const handleSave = () => {
    updateProfile(
      {
        name: settings.name,
        email: settings.email,
      },
      {
        onSuccess: loadUserFromStorage,
      },
    );
  };

  /* ✅ Update password */
  const handlePasswordUpdate = () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      return toast.error("All fields are required");
    }


    updatePassword(
      {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      },
      {
        onSuccess: () => {
          setPasswords({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        },
      },
    );
  };

  return (
    <DashboardLayout title="Settings" breadcrumbs={[{ label: "Settings" }]}>
      <div className="dashboard-card p-6 space-y-10">
        {/* ================= PROFILE ================= */}
        <div>
          <h3 className="section-title mb-4">Profile Information</h3>

          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {initials}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="input-field"
              value={settings.name}
              placeholder="Full Name"
              onChange={(e) =>
                setSettings({ ...settings, name: e.target.value })
              }
            />
            <input
              className="input-field"
              value={settings.email}
              placeholder="Email"
              onChange={(e) =>
                setSettings({ ...settings, email: e.target.value })
              }
            />
            <input
              className="input-field"
              value={settings.phoneNumber}
              disabled
            />
            <input
              className="input-field bg-muted"
              value="Administrator"
              disabled
            />
          </div>

          <div className="flex justify-end pt-6 mt-6 border-t">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* ================= PASSWORD ================= */}
        <div>
          <h3 className="section-title mb-4">Update Password</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="password"
              className="input-field"
              placeholder="Current Password"
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  currentPassword: e.target.value,
                })
              }
            />

            <input
              type="password"
              className="input-field"
              placeholder="New Password"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  newPassword: e.target.value,
                })
              }
            />
          </div>

          <div className="flex justify-end pt-6 mt-6 border-t">
            <button
              onClick={handlePasswordUpdate}
              disabled={passwordLoading}
              className="btn-primary"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
