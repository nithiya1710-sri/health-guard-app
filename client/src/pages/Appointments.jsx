import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import '../styles/Appointments.css'
export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/appointments")
      .then((res) => {
        const data = res.data || [];

        // Filter out invalid/empty entries
        const validAppointments = data.filter((appt) => {
          // Must have hospital name AND date AND time
          return (
            appt &&
            appt.hospital && appt.hospital.trim() !== "" &&
            appt.date && appt.date.trim() !== "" &&
            appt.time && appt.time.trim() !== ""
          );
        });

        // Optional: sort by date descending (newest first)
        const sorted = validAppointments.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });

        setAppointments(sorted);
      })
      .catch((err) => {
        console.error("Failed to load appointments:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleBookNow = () => {
    navigate("/hospitals");
  };

  if (loading) {
    return (
      <div className="appointments-page">
        <div className="loading">Loading your appointments...</div>
      </div>
    );
  }

  return (
    <div className="appointments-page">
      <header className="page-header">
        <h2>My Appointments</h2>
        <p className="subtitle">
          Your booking history and scheduled visits
        </p>
      </header>

      <div className="action-bar">
        <button className="btn btn-primary" onClick={handleBookNow}>
          Book New Appointment
        </button>
      </div>

      {appointments.length > 0 ? (
        <div className="appointments-grid">
          {appointments.map((appt, index) => (
            <div
              key={index}
              className={`appointment-card ${appt.status || "upcoming"}`}
            >
              <div className="card-header">
                <h4 className="hospital-name">{appt.hospital}</h4>
                <span className={`status-badge ${appt.status || "upcoming"}`}>
                  {appt.status
                    ? appt.status.charAt(0).toUpperCase() + appt.status.slice(1)
                    : "Upcoming"}
                </span>
              </div>

              <div className="card-body">
                <div className="info-row">
                  <span className="label">Date:</span>
                  <span className="value">{appt.date}</span>
                </div>
                <div className="info-row">
                  <span className="label">Time:</span>
                  <span className="value">{appt.time}</span>
                </div>

                {appt.doctor && (
                  <div className="info-row">
                    <span className="label">Doctor:</span>
                    <span className="value">{appt.doctor}</span>
                  </div>
                )}

                {appt.specialty && (
                  <div className="info-row">
                    <span className="label">Specialty:</span>
                    <span className="value">{appt.specialty}</span>
                  </div>
                )}
              </div>

              <div className="card-actions">
                <button className="btn btn-secondary">View Details</button>
                {appt.status === "upcoming" && (
                  <button className="btn btn-danger">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Optional: minimal message when truly no valid appointments
        <div className="no-appointments">
          <p>You don't have any appointments yet.</p>
        </div>
      )}
    </div>
  );
}