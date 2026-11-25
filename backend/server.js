const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./database");

const app = express();
app.use(cors());
app.use(express.json());

// Normalize time to HH:MM (24-hour)
// Normalize time to HH:MM (24-hour)
function normalizeTime(input) {
  if (typeof input !== "string") return null;

  const value = input.trim().toUpperCase().replace(/\s+/g, " ");

  // Formats: 10 AM, 10:00 AM, 2:30 PM
  const twelveHour = value.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);

  if (twelveHour) {
    let hours = Number(twelveHour[1]);
    const minutes = Number(twelveHour[2] || "00");
    const period = twelveHour[3];

    if (hours < 1 || hours > 12 || minutes > 59) return null;

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  // Format: 14:00
  const twentyFourHour = value.match(/^(\d{1,2}):(\d{2})$/);

  if (twentyFourHour) {
    const hours = Number(twentyFourHour[1]);
    const minutes = Number(twentyFourHour[2]);

    if (hours > 23 || minutes > 59) return null;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }

  return null;
}

// Validate date format and real calendar date
function normalizeDate(input) {
  if (typeof input !== "string") return null;

  const value = input.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return value;
}

// Seed doctors if empty
const doctorCount = db.prepare("SELECT COUNT(*) AS total FROM doctors").get();

if (doctorCount.total === 0) {
  const insertDoctor = db.prepare(`
    INSERT INTO doctors (name, specialization, available)
    VALUES (?, ?, ?)
  `);

  insertDoctor.run("Dr. Meera Sharma", "General Physician", 1);
  insertDoctor.run("Dr. Arjun Rao", "Cardiologist", 1);
  insertDoctor.run("Dr. Sana Ali", "Dermatologist", 1);
}

// GET doctors
app.get("/api/doctors", (req, res) => {
  res.json(db.prepare("SELECT * FROM doctors ORDER BY id").all());
});

// GET doctor availability
app.get("/api/doctors/availability", (req, res) => {
  const { doctor, date } = req.query;
  const normalizedDate = normalizeDate(date);

  if (!doctor || !normalizedDate) {
    return res.status(400).json({
      message: "Doctor and valid date (YYYY-MM-DD) are required."
    });
  }

  const selectedDoctor = db.prepare(
    "SELECT * FROM doctors WHERE name = ?"
  ).get(doctor);

  if (!selectedDoctor) {
    return res.status(404).json({ message: "Doctor not found." });
  }

  if (!selectedDoctor.available) {
    return res.json({
      doctor,
      date: normalizedDate,
      available: false,
      bookedSlots: [],
      message: "Doctor is unavailable."
    });
  }

  const bookedSlots = db.prepare(`
    SELECT time FROM appointments
    WHERE doctor = ? AND date = ? AND status = 'Confirmed'
  `).all(doctor, normalizedDate)
    .map(slot => normalizeTime(slot.time))
    .filter(Boolean);

  res.json({
    doctor,
    date: normalizedDate,
    available: true,
    bookedSlots,
    message: "Availability retrieved successfully."
  });
});

// Seed sample appointments if empty
const appointmentCount = db.prepare(
  "SELECT COUNT(*) AS total FROM appointments"
).get();

if (appointmentCount.total === 0) {
  const insertSample = db.prepare(`
    INSERT INTO appointments
    (patient, doctor, date, time, reason, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertSample.run(
    "Ananya Reddy",
    "Dr. Meera Sharma",
    "2026-11-24",
    "09:00",
    "General Consultation",
    "Confirmed"
  );

  insertSample.run(
    "Rahul Varma",
    "Dr. Arjun Rao",
    "2026-11-24",
    "10:30",
    "Cardiology",
    "Confirmed"
  );
}

// Home
app.get("/", (req, res) => {
  res.json({
    message: "NOVA CARE backend is running successfully!"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    project: "NOVA CARE"
  });
});

// GET appointments
app.get("/api/appointments", (req, res) => {
  res.json(
    db.prepare("SELECT * FROM appointments ORDER BY id DESC").all()
  );
});

// BOOK appointment
app.post("/api/appointments", (req, res) => {
  const { patient, phone, doctor, date, time, reason } = req.body;

  const normalizedDate = normalizeDate(date);
  const normalizedTime = normalizeTime(time);

  if (
    !patient ||
    !phone ||
    !doctor ||
    !normalizedDate ||
    !normalizedTime ||
    !reason
  ) {
    return res.status(400).json({
      message: "All details are required. Use a valid date (YYYY-MM-DD) and time (10:00 AM or 14:00)."
    });
  }

  const selectedDoctor = db.prepare(
    "SELECT * FROM doctors WHERE name = ?"
  ).get(doctor);

  if (!selectedDoctor) {
    return res.status(404).json({ message: "Doctor not found." });
  }

  if (!selectedDoctor.available) {
    return res.status(409).json({
      message: "This doctor is currently unavailable."
    });
  }

  
  // Check duplicate confirmed slots across different date/time formats
const existingAppointments = db.prepare(`
  SELECT date, time FROM appointments
  WHERE doctor = ? AND status = 'Confirmed'
`).all(doctor);

const isBooked = existingAppointments.some(appointment => {
  const existingDate = normalizeStoredDate(appointment.date);
  const existingTime = normalizeTime(appointment.time);

  return existingDate === normalizedDate &&
         existingTime === normalizedTime;
});

if (isBooked) {
  return res.status(409).json({
    message: "This appointment slot is already booked."
  });
}

  try {
    const result = db.prepare(`
      INSERT INTO appointments
      (patient, phone, doctor, date, time, reason, status)
      VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')
    `).run(
      patient.trim(),
      String(phone).trim(),
      doctor,
      normalizedDate,
      normalizedTime,
      reason.trim()
    );

    res.status(201).json({
      message: "Appointment booked successfully!",
      appointmentId: result.lastInsertRowid
    });

  } catch (error) {
    console.error("Booking error:", error);

    res.status(500).json({
      message: "Unable to book appointment."
    });
  }
});

// Cancel/delete appointment by ID
app.delete("/api/appointments/:id", (req, res) => {
  const appointmentId = Number(req.params.id);

  const result = db.prepare(
    "DELETE FROM appointments WHERE id = ?"
  ).run(appointmentId);

  if (result.changes === 0) {
    return res.status(404).json({
      message: "Appointment not found."
    });
  }

  res.json({
    message: "Appointment cancelled successfully!"
  });
});

// Cancel appointment by phone number
app.post("/api/appointments/cancel", (req, res) => {
  const { phone, doctor, date } = req.body;

  if (!phone) {
    return res.status(400).json({
      message: "Phone number is required."
    });
  }

  let appointments = db.prepare(`
    SELECT * FROM appointments
    WHERE phone = ? AND status = 'Confirmed'
  `).all(String(phone).trim());

  if (doctor) {
    appointments = appointments.filter(
      appointment =>
        appointment.doctor.toLowerCase().includes(
          String(doctor).toLowerCase()
        )
    );
  }

  if (date) {
    appointments = appointments.filter(
      appointment => appointment.date === date
    );
  }

  if (appointments.length === 0) {
    return res.status(404).json({
      message: "No matching confirmed appointment found."
    });
  }

  if (appointments.length > 1) {
    return res.status(409).json({
      message: "Multiple appointments found. Please specify the appointment.",
      appointments
    });
  }

  const appointment = appointments[0];

  db.prepare(
    "UPDATE appointments SET status = 'Cancelled' WHERE id = ?"
  ).run(appointment.id);

  res.json({
    message: "Appointment cancelled successfully.",
    appointment
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`NOVA CARE backend running on port ${PORT}`);
});