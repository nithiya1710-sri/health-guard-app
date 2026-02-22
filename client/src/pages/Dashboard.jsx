// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Calendar,
  Building2,
  AlertCircle,
  HeartPulse,
  User,
  TabletIcon,
  Pill,
  Clock,
} from 'lucide-react';

import "../styles/Dashboard.css"
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from "firebase/auth";

const Dashboard = () => {
  const [displayName, setDisplayName] = useState('...');
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [profileImage, setProfileImage] = useState("");
  const getInitials = (name) => {
    if (!name || name === '...' || name === 'Guest' || name === 'Error' || name.trim() === '') {
      return '?';
    }
    const cleaned = name.trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  useEffect(() => {
    const fetchUserProfile = async () => {

      const currentUser = auth.currentUser;

      if (!currentUser) {
        setDisplayName('Guest');
        setLoading(false);
        return;
      }

      try {

        const profileRef =
          doc(db, 'profiles', currentUser.uid);

        const profileSnap =
          await getDoc(profileRef);

        if (profileSnap.exists()) {

          const data = profileSnap.data();

          setDisplayName(
            data.name ||
            currentUser.displayName ||
            "User"
          );

          setProfileImage(
            data.image ||
            currentUser.photoURL ||
            ""
          );

        }
        else {

          /* Google login fallback */

          setDisplayName(
            currentUser.displayName || "User"
          );

          setProfileImage(
            currentUser.photoURL || ""
          );

        }

      }
      catch (err) {

        console.log(err);

        setDisplayName("Error");

      }
      finally {

        setLoading(false);

      }

    };

    fetchUserProfile();

    // Listen for auth state changes (logout / session refresh)
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setDisplayName('Guest');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="welcome-text">
            <h1>
              Welcome back, {loading ? '...' : displayName}
              {profileError && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}> (!)</span>}
            </h1>
            <p>How can we help you stay healthy today?</p>
          </div>
          <div className="header-right">

            <div className="header-right">

              <Link to="/profile" className="profile-link">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={`${displayName || 'User'} profile picture`}
                    className="profile-pic"
                    onError={(e) => {
                      e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(displayName || "User") + "&background=eee&color=333";
                      e.target.onerror = null; // prevent infinite loop
                    }}
                  />
                ) : (
                  <div className="profile-avatar-initials">
                    {getInitials(displayName)}
                  </div>
                )}
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* Main content container */}
      <main className="main-content">
        {/* Quick Actions Grid */}
        <section className="quick-actions">
          <div className="action-grid">
            <Link to="/doctors" className="action-card doctor-card">
              <div className="card-icon-wrapper">
                <Stethoscope className="card-icon" />
              </div>
              <h2>Find Doctors</h2>
              <p>Search by specialty, location, availability</p>
            </Link>

            <Link to="/appointments" className="action-card appointment-card">
              <div className="card-icon-wrapper">
                <Calendar className="card-icon" />
              </div>
              <h2>Appointments</h2>
              <p>View & manage your bookings</p>
            </Link>

            <Link to="/hospitals" className="action-card hospital-card">
              <div className="card-icon-wrapper">
                <Building2 className="card-icon" />
              </div>
              <h2>Nearby Hospitals</h2>
              <p>Find clinics & emergency centers</p>
            </Link>

            <Link to="/sos" className="action-card sos-card">
              <div className="card-icon-wrapper">
                <AlertCircle className="card-icon sos-icon" />
              </div>
              <h2>Emergency SOS</h2>
              <p>Immediate help – share location now</p>
            </Link>

            <Link to="/prescription" className="action-card">
              <div className="card-icon-wrapper">
                <Pill className="card-icon" />
              </div>
              <h2>Prescription</h2>
              <p>Search medicines and view details</p>
            </Link>

            <Link to="/remainders" className="action-card reminder-card">
              <div className="card-icon-wrapper">
                <Clock className='card-icon'/>
              </div>
              <h2>Reminders</h2>
              <p>Track medicine and health tasks</p>
            </Link>
          </div>
        </section>


      </main>
    </div>
  );
};

export default Dashboard;