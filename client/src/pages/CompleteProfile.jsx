import { useState } from "react";
import { auth, db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "../styles/CompleteProfile.css";

export default function CompleteProfile() {
  const navigate = useNavigate();

  /* ======================
     STATE
  ====================== */
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [condition, setCondition] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [emergencyEmail, setEmergencyEmail] = useState(""); // ← NEW
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ======================
     UPLOAD IMAGE TO CLOUDINARY
  ====================== */
  const uploadImage = async () => {
    if (!image) return "";

    try {
      const data = new FormData();
      data.append("file", image);
      data.append("upload_preset", "unsigned"); // ← your preset name

      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dgl2vykau/image/upload",
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      return res.data.secure_url;
    } catch (err) {
      console.error("Cloudinary Error:", err.response?.data || err);
      alert("Image upload failed");
      return "";
    }
  };

  /* ======================
     SAVE PROFILE
  ====================== */
  const saveProfile = async () => {
    try {
      if (!name.trim() || !phone.trim()) {
        alert("Name and Phone Number are required");
        return;
      }

      // Optional: simple email validation if provided
      if (emergencyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emergencyEmail)) {
        alert("Please enter a valid emergency contact email (or leave blank)");
        return;
      }

      setLoading(true);

      const imageURL = await uploadImage();

      await setDoc(doc(db, "profiles", auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        name: name.trim(),
        age: age.trim() || null,
        bloodGroup: bloodGroup || null,
        condition: condition.trim() || null,
        phone: phone.trim(),
        address: address.trim() || null,
        emergencyEmail: emergencyEmail.trim() || null, // ← NEW: saved here
        image: imageURL,
        createdAt: new Date(),
      });

      alert("Profile Saved Successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error saving profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     UI
  ====================== */
  return (
    <div className="container">
      <div className="card">
        <div className="title">Complete Your Profile</div>

        {/* Avatar Preview */}
        {image && (
          <div className="avatar-preview">
            <img
              src={URL.createObjectURL(image)}
              alt="Profile preview"
              className="preview-img"
            />
          </div>
        )}

        {/* File Input */}
        <div className="form-group">
          <label className="label">Profile Photo</label>
          <input
            type="file"
            accept="image/*"
            className="input file-input"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </div>

        {/* Form Fields */}
        <div className="form-group">
          <label className="label">Full Name *</label>
          <input
            className="input"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="label">Age</label>
          <input
            className="input"
            placeholder="Your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="label">Blood Group</label>
          <select
            className="input"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
          >
            <option value="">Select blood group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div className="form-group">
          <label className="label">Medical Condition (optional)</label>
          <input
            className="input"
            placeholder="e.g., Diabetes, Asthma, None"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="label">Phone Number *</label>
          <input
            className="input"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="label">Address (optional)</label>
          <input
            className="input"
            placeholder="Your current address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* ── NEW: Emergency Email Field ── */}
        <div className="form-group">
          <label className="label">Emergency Contact Email (optional)</label>
          <input
            className="input"
            type="email"
            placeholder="friend.family@example.com"
            value={emergencyEmail}
            onChange={(e) => setEmergencyEmail(e.target.value)}
          />
          <small className="help-text">
            Email of a trusted person to notify in case of health emergency
          </small>
        </div>

        <button
          className="button"
          onClick={saveProfile}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}