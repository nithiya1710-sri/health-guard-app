// src/pages/Hospitals.jsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";
import "leaflet/dist/leaflet.css";
import '../styles/Hospitals.css';
import L from "leaflet";
export default function Hospitals() {
  const [location, setLocation] = useState(null);
  const [allHospitals, setAllHospitals] = useState([]);
  const [nearHospitals, setNearHospitals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // Distance Calculation
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation([lat, lng]);

        // Fetch nearby hospitals from Overpass API (within ~8 km)
        axios
          .get(
            `https://overpass.kumi.systems/api/interpreter?data=[out:json];node["amenity"="hospital"](around:8000,${lat},${lng});out;`
          )
          .then((res) => {
            let data = res.data.elements
              .filter((el) => el.tags?.name) // only hospitals with name
              .map((h) => ({
                name: h.tags.name,
                lat: h.lat,
                lng: h.lon,
                distance: getDistance(lat, lng, h.lat, h.lon),
              }));

            // All for map
            setAllHospitals(data);

            // Nearest 10 for list
            data.sort((a, b) => a.distance - b.distance);
            setNearHospitals(data.slice(0, 9));
          })
          .catch((err) => console.error("Hospital fetch error:", err));
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true }
    );

    // Load user's appointments
    api
      .get("/appointments")
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error("Appointments fetch error:", err));
  }, []);

  const bookAppointment = async () => {
    if (!selectedHospital) return alert("Please select a hospital");
    if (!date || !time) return alert("Please select date and time");

    try {
      await api.post("/appointments", { hospital: selectedHospital, date, time });
      alert("Appointment booked successfully!");

      // Refresh appointments
      const res = await api.get("/appointments");
      setAppointments(res.data);

      // Reset form
      setSelectedHospital("");
      setDate("");
      setTime("");
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to book appointment");
    }
  };

  if (!location) return <div className="loading">Loading your location and nearby hospitals...</div>;

  return (
    <div className="hospitals-page">
      <header className="page-header">
        <h1>Hospital Finder</h1>
        <p>Find nearby hospitals and book appointments instantly</p>
      </header>

      {/* Map Section */}
      <section className="map-section">
        <MapContainer center={location} zoom={13} className="leaflet-map">
<TileLayer
  url="https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | CyclOSM style'
/>          <Marker position={location}>
            <Popup>You are here</Popup>
          </Marker>

          {allHospitals.map((h, i) => (
            <Marker key={i} position={[h.lat, h.lng]}>
              <Popup>
                <h3>{h.name}</h3>
                <p>Distance: {h.distance.toFixed(1)} km</p>
                <button
                  className="btn btn-select"
                  onClick={() => setSelectedHospital(h.name)}
                >
                  Select Hospital
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </section>

      {/* Nearby Hospitals List */}
      <section className="nearby-section">
        <h2>Nearby Hospitals</h2>
        <div className="hospital-list">
          {nearHospitals.map((h, i) => (
            <div key={i} className="hospital-card">
              <h3>{h.name}</h3>
              <p className="distance">≈ {h.distance.toFixed(1)} km away</p>
              <button
                className="btn btn-book"
                onClick={() => setSelectedHospital(h.name)}
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Form */}
      <section className="booking-section">
        <h2>Book Appointment</h2>
        <div className="booking-form">
          <div className="form-group">
            <label>Selected Hospital</label>
            <div className="selected-hospital">{selectedHospital || "None selected"}</div>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <button className="btn btn-confirm" onClick={bookAppointment}>
            Confirm Booking
          </button>
        </div>
      </section>

      {/* My Appointments */}
      <section className="appointments-section">
        <h2>My Appointments</h2>
        {appointments.length === 0 ? (
          <p className="no-data">No appointments booked yet.</p>
        ) : (
          <div className="appointment-list">
            {appointments.map((a, i) => (
              <div key={i} className="appointment-card">
                <h3>{a.hospital}</h3>
                <p><strong>Date:</strong> {a.date}</p>
                <p><strong>Time:</strong> {a.time}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}