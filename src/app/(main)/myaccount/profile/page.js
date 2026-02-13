"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getProfile, updateUserProfileReq } from "@/services/auth/auth";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    getProfile().then((data) => { setProfile(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("first_name", profile.first_name || "");
      fd.append("last_name", profile.last_name || "");
      fd.append("phone", profile.phone || "");
      // Backend expects single file field named "image" (see auth.routes.js userUpload.single('image'))
      if (image) fd.append("image", image);
      await updateUserProfileReq(fd, toast);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden">
            {(image || profile?.profile_picture) && (
              <img src={image ? URL.createObjectURL(image) : profile.profile_picture} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="formLabelClasses block mb-1">First Name</label>
            <input type="text" value={profile?.first_name || ""} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })} className="input_style" />
          </div>
          <div>
            <label className="formLabelClasses block mb-1">Last Name</label>
            <input type="text" value={profile?.last_name || ""} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })} className="input_style" />
          </div>
        </div>
        <div>
          <label className="formLabelClasses block mb-1">Email</label>
          <input type="email" value={profile?.email || ""} className="input_style bg-gray-50" disabled />
        </div>
        <div>
          <label className="formLabelClasses block mb-1">Phone</label>
          <input type="text" value={profile?.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="input_style" />
        </div>
        <button type="submit" disabled={saving} className="bg-brand-600 text-white rounded-lg px-6 py-2.5 font-semibold hover:bg-brand-700 disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
