import { useState, useEffect } from "react";
import { Search, Plus, X, CalendarDays } from "lucide-react";

const API_URL = "http://localhost:5000/api/appointments";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [newAppointment, setNewAppointment] = useState({
    patient: "",
    doctor: "",
    date: "",
    time: "",
    reason: "",
  });

  // Load appointments from backend
  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to load appointments.");
      }

      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      setError("Unable to connect to backend. Please check your server.");
    } finally {
      setLoading(false);
    }
  }

  // Search appointments
  const filteredAppointments = appointments.filter((appointment) =>
    `${appointment.patient} ${appointment.doctor} ${appointment.reason}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Add appointment to backend
  async function handleAddAppointment(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAppointment),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to book appointment.");
      }

      await fetchAppointments();

      setNewAppointment({
        patient: "",
        doctor: "",
        date: "",
        time: "",
        reason: "",
      });

      setShowForm(false);
    } catch (err) {
      setError(err.message || "Failed to add appointment.");
    } finally {
      setSaving(false);
    }
  }

  // Cancel appointment in backend
  async function handleCancel(id) {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmCancel) return;

    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to cancel appointment.");
      }

      await fetchAppointments();
    } catch (err) {
      setError(err.message || "Failed to cancel appointment.");
    }
  }

  return (
    <div style={{ padding: "10px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "24px" }}>
            Appointments
          </h2>

          <p style={{ color: "#64748b", marginTop: "8px" }}>
            Manage and track patient appointments
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Plus size={18} />
          Add Appointment
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {showForm && (
        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            marginBottom: "25px",
            border: "1px solid #e2e8f0",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Book Appointment</h3>

          <form onSubmit={handleAddAppointment}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "15px",
              }}
            >
              <input
                placeholder="Patient Name"
                required
                value={newAppointment.patient}
                onChange={(e) =>
                  setNewAppointment({
                    ...newAppointment,
                    patient: e.target.value,
                  })
                }
              />

              <select
                required
                value={newAppointment.doctor}
                onChange={(e) =>
                  setNewAppointment({
                    ...newAppointment,
                    doctor: e.target.value,
                  })
                }
              >
                <option value="">Select Doctor</option>
                <option value="Dr. Meera Sharma">Dr. Meera Sharma</option>
                <option value="Dr. Arjun Rao">Dr. Arjun Rao</option>
                <option value="Dr. Sana Ali">Dr. Sana Ali</option>
              </select>

              <input
                type="date"
                required
                value={newAppointment.date}
                onChange={(e) =>
                  setNewAppointment({
                    ...newAppointment,
                    date: e.target.value,
                  })
                }
              />

              <input
                type="time"
                required
                value={newAppointment.time}
                onChange={(e) =>
                  setNewAppointment({
                    ...newAppointment,
                    time: e.target.value,
                  })
                }
              />

              <input
                placeholder="Reason for appointment"
                required
                value={newAppointment.reason}
                onChange={(e) =>
                  setNewAppointment({
                    ...newAppointment,
                    reason: e.target.value,
                  })
                }
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "11px 18px",
                  borderRadius: "8px",
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving..." : "Save Appointment"}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  padding: "11px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "12px 15px",
          marginBottom: "20px",
        }}
      >
        <Search size={18} color="#64748b" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patient, doctor or reason..."
          style={{
            border: "none",
            outline: "none",
            width: "100%",
            background: "transparent",
          }}
        />
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "750px",
          }}
        >
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {[
                "Patient",
                "Doctor",
                "Date",
                "Time",
                "Reason",
                "Status",
                "Action",
              ].map((heading) => (
                <th
                  key={heading}
                  style={{
                    padding: "15px",
                    textAlign: "left",
                    fontSize: "13px",
                    color: "#64748b",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  Loading appointments...
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td style={cellStyle}>{appointment.patient}</td>
                  <td style={cellStyle}>{appointment.doctor}</td>
                  <td style={cellStyle}>{appointment.date}</td>
                  <td style={cellStyle}>{appointment.time}</td>
                  <td style={cellStyle}>{appointment.reason}</td>

                  <td style={cellStyle}>
                    <span
                      style={{
                        background: "#dcfce7",
                        color: "#166534",
                        padding: "5px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                      }}
                    >
                      {appointment.status}
                    </span>
                  </td>

                  <td style={cellStyle}>
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      title="Cancel appointment"
                      style={{
                        background: "#fee2e2",
                        color: "#dc2626",
                        border: "none",
                        borderRadius: "7px",
                        padding: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}

            {!loading && filteredAppointments.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  <CalendarDays size={25} />
                  <p>No appointments found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p
        style={{
          color: "#64748b",
          marginTop: "15px",
          fontSize: "13px",
        }}
      >
        Total appointments: {appointments.length}
      </p>
    </div>
  );
}

const cellStyle = {
  padding: "15px",
  textAlign: "left",
  borderBottom: "1px solid #f1f5f9",
  fontSize: "14px",
};