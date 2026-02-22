import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios from "axios";
import "../styles/Profile.css";

export default function Profile() {
  const [profile, setProfile] = useState({});
  const [edit, setEdit] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const ref = doc(db, "profiles", auth.currentUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        setProfile({
          name: auth.currentUser.displayName || "",
          email: auth.currentUser.email || "",
          phone: "",
          age: "",
          gender: "",
          bloodGroup: "",
          condition: "",
          address: "",
          image: auth.currentUser.photoURL || "",
          emergencyName: "",
          emergencyPhone: "",
          relationship: "",
          emergencyEmail: "",
        });
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async () => {
    if (!image) return profile.image || "";

    try {
      const data = new FormData();
      data.append("file", image);
      data.append("upload_preset", "healthguard");

      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dgl2vykau/image/upload",
        data
      );
      return res.data.secure_url;
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image");
      return profile.image || "";
    }
  };

  const updateProfile = async () => {
    // Basic validation
    if (!profile.name?.trim()) {
      alert("Full Name is required");
      return;
    }
    if (!profile.emergencyPhone?.trim()) {
      alert("Emergency Contact Phone is recommended — please fill it");
      return;
    }

    try {
      setLoading(true);
      const imgUrl = await uploadImage();

      const updatedProfile = {
        ...profile,
        name: profile.name.trim(),
        phone: profile.phone?.trim() || "",
        age: profile.age?.trim() || "",
        gender: profile.gender || "",
        bloodGroup: profile.bloodGroup || "",
        condition: profile.condition?.trim() || "",
        address: profile.address?.trim() || "",
        emergencyName: profile.emergencyName?.trim() || "",
        emergencyPhone: profile.emergencyPhone.trim(),
        relationship: profile.relationship || "",
        emergencyEmail: profile.emergencyEmail?.trim() || "",
        image: imgUrl,
        updatedAt: new Date(),
      };

      await setDoc(doc(db, "profiles", auth.currentUser.uid), updatedProfile, { merge: true });

      setProfile(updatedProfile);
      setImage(null); // reset file input
      alert("Profile updated successfully!");
      setEdit(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading profile...</div>;
  }

  return (
    <div className="container">
      <div className="card profile-card">
        <h2 className="title">My Health Profile</h2>

        {/* Avatar Section */}
        <div className="avatar-wrapper">
          <img
            src={image ? URL.createObjectURL(image) : profile.image || "https://via.placeholder.com/120"}
            alt="Profile"
            className="avatar-img"
          />
          {edit && (
            <div className="file-upload">
              <label htmlFor="profile-photo" className="file-label">
                Change Photo
              </label>
              <input
                id="profile-photo"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </div>
          )}
        </div>

        {/* ─────────────── Personal Information ─────────────── */}
        <div className="section-title">Personal Information</div>

        <div className="form-group">
          <label className="label">Full Name *</label>
          <input
            className="input"
            value={profile.name || ""}
            disabled={!edit}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="label">Email (from account)</label>
          <input className="input" value={auth.currentUser.email || ""} disabled />
        </div>

        <div className="form-group">
          <label className="label">Gender</label>
          <div className="radio-group">
            {["Male", "Female", "Other", "Prefer not to say"].map((g) => (
              <label key={g} className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={profile.gender === g}
                  disabled={!edit}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="label">Age</label>
          <input
            className="input"
            type="number"
            placeholder="Enter your age"
            value={profile.age || ""}
            disabled={!edit}
            onChange={(e) => setProfile({ ...profile, age: e.target.value })}
          />
        </div>

        {/* ─────────────── Medical Information ─────────────── */}
        <div className="section-title">Medical Information</div>

        <div className="form-group">
          <label className="label">Blood Group</label>
          <select
            className="input"
            value={profile.bloodGroup || ""}
            disabled={!edit}
            onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
          >
            <option value="">Select</option>
            <option>A+</option>
            <option>A-</option>
            <option>B+</option>
            <option>B-</option>
            <option>AB+</option>
            <option>AB-</option>
            <option>O+</option>
            <option>O-</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label">Medical Condition / Allergies</label>
          <input
            className="input"
            placeholder="e.g. Diabetes, Asthma, Penicillin allergy, None"
            value={profile.condition || ""}
            disabled={!edit}
            onChange={(e) => setProfile({ ...profile, condition: e.target.value })}
          />
        </div>

        {/* ─────────────── Contact & Emergency ─────────────── */}
        <div className="section-title">Contact & Emergency</div>

        <div className="form-group">
          <label className="label">Phone Number</label>
          <input
            className="input"
            placeholder="+91 6xxxx 5xxxx"
            value={profile.phone || ""}
            disabled={!edit}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="label">Address</label>
          <input
            className="input"
            placeholder="Your current residential address"
            value={profile.address || ""}
            disabled={!edit}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="label">Emergency Contact Name</label>
          <input
            className="input"
            placeholder="John Doe"
            value={profile.emergencyName || ""}
            disabled={!edit}
            onChange={(e) => setProfile({ ...profile, emergencyName: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="label">Emergency Contact Phone (recommended) *</label>
          <input
            className="input"
            placeholder="+91 9xxxx 5xxxx"
            value={profile.emergencyPhone || ""}
            disabled={!edit}
            onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="label">Relationship</label>
          <select
            className="input"
            value={profile.relationship || ""}
            disabled={!edit}
            onChange={(e) => setProfile({ ...profile, relationship: e.target.value })}
          >
            <option value="">Select relationship</option>
            <option value="Parent">Parent</option>
            <option value="Spouse">Spouse / Partner</option>
            <option value="Sibling">Sibling</option>
            <option value="Child">Child</option>
            <option value="Friend">Friend</option>
            <option value="Relative">Other Relative</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label">Emergency Contact Email (Recommended)*</label>
          <input
            className="input"
            type="email"
            placeholder="name@mail.com"
            value={profile.emergencyEmail || ""}
            disabled={!edit}
            onChange={(e) => setProfile({ ...profile, emergencyEmail: e.target.value })}
          />
        </div>

        {/* Buttons */}
        <div className="button-group">
          {edit ? (
            <>
              <button className="button primary" onClick={updateProfile} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button className="button secondary" onClick={() => { setEdit(false); setImage(null); }}>
                Cancel
              </button>
            </>
          ) : (
            <button className="button primary" onClick={() => setEdit(true)}>
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}