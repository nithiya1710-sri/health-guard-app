import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

import "../styles/Remainders.css";

export default function Reminders() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;

  // Better: only load current user's reminders
  const loadReminders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const q = query(
        collection(db, "reminders"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);

      const reminders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort: pending first, then by date
      reminders.sort((a, b) => {
        if (a.status === "pending" && b.status !== "pending") return -1;
        if (a.status !== "pending" && b.status === "pending") return 1;
        return new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`);
      });

      setList(reminders);
    } catch (error) {
      console.error("Error loading reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const addReminder = async () => {
    if (!user || !title.trim() || !date || !time) return;

    try {
      await addDoc(collection(db, "reminders"), {
        title: title.trim(),
        date,
        time,
        status: "pending",
        email: user.email,
        userId: user.uid,
        createdAt: new Date().toISOString(),
      });

      setTitle("");
      setDate("");
      setTime("");
      loadReminders();
    } catch (error) {
      console.error("Error adding reminder:", error);
    }
  };

  const completeTask = async (id) => {
    try {
      await updateDoc(doc(db, "reminders", id), {
        status: "done",
        completedAt: new Date().toISOString(),
      });
      loadReminders();
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  useEffect(() => {
    loadReminders();
  }, [user]);

  return (
    <div className="reminders-container">
      <header className="reminders-header">
        <h1>Health Reminders</h1>
        <p className="subtitle">Stay on top of your health routine</p>
      </header>

      <div className="add-reminder-card">
        <div className="form-group">
          <label htmlFor="title">Reminder</label>
          <input
            id="title"
            type="text"
            placeholder="e.g. Take morning insulin, Yoga session, Eye checkup..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-title"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Time</label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={addReminder}
          disabled={!title.trim() || !date || !time || !user}
        >
          Add Reminder
        </button>
      </div>

      <section className="reminders-list">
        <h2>Upcoming Tasks</h2>

        {loading ? (
          <div className="loading">Loading your reminders...</div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <p>No reminders yet.</p>
            <p>Add your first health reminder above.</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {list.map((reminder) => (
              <div
                key={reminder.id}
                className={`task-card ${reminder.status === "done" ? "done" : ""}`}
              >
                <div className="task-content">
                  <h3 className="task-title">{reminder.title}</h3>
                  <div className="task-datetime">
                    <span>{reminder.date}</span>
                    <span>{reminder.time}</span>
                  </div>
                </div>

                <div className="task-actions">
                  <span className={`status-badge ${reminder.status}`}>
                    {reminder.status === "pending" ? "Pending" : "Completed"}
                  </span>

                  {reminder.status === "pending" && (
                    <button
                      className="btn btn-complete"
                      onClick={() => completeTask(reminder.id)}
                    >
                      Mark as Done
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}