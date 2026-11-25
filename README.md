# NOVA CARE — Voice AI Doctor Appointment Assistant

NOVA CARE is a clinic appointment management dashboard with a voice-based AI receptionist. Patients can interact with the receptionist by voice to request appointments, check doctor selection and availability, and cancel appointments. The clinic team can manage doctors and monitor appointments through a web dashboard.

## Features

- **Clinic dashboard:** Overview of appointments, doctors and receptionist activity.
- **Appointment management:** View and manage patient appointments.
- **Doctor management:** View doctors and their availability.
- **Voice AI receptionist:** Voice interaction for appointment booking and cancellation.
- **Caller identification:** Collects the caller's phone number during the conversation.
- **Booking validation:** Validates booking details and checks for booked slots.
- **Live transcript:** Displays the conversation during a receptionist session.
- **SQLite database:** Stores doctors and appointments locally.

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **Database:** SQLite using better-sqlite3
- **Voice interface:** Browser speech recognition and speech synthesis (browser support required)

## Project Structure

```text
nova-care/
├── backend/
│   ├── server.js
│   ├── database.js
│   ├── nova-care.db
│   ├── package.json
│   └── ...
└── frontend/
    ├── src/
    ├── public/
    ├── package.json
    └── ...
```

## Requirements

- Node.js and npm
- A browser that supports the speech recognition/speech synthesis features used by the app (Chrome is recommended for testing)

## Run Locally

### 1. Backend

Open a terminal:

```bash
cd backend
npm install
npm run dev
```

The backend runs on port `5000` by default.

Health check:

```text
http://localhost:5000/api/health
```

### 2. Frontend

Open a second terminal from the project root:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (typically `http://localhost:5173`).

## Database

The backend uses the SQLite database file `backend/nova-care.db`. The database is created and initialized by `database.js`.

Keep the database file if you want to retain the locally stored appointment and doctor records. Do not commit secrets or environment files.

## API Overview

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Backend health check |
| `/api/doctors` | GET | Retrieve doctors |
| `/api/doctors/availability` | GET | Retrieve a doctor's booked slots for a date |
| `/api/appointments` | GET | Retrieve appointments |
| `/api/appointments` | POST | Create an appointment |
| `/api/appointments/:id` | DELETE | Delete an appointment by ID |
| `/api/appointments/cancel` | POST | Cancel a confirmed appointment using caller details |

## Testing Notes

- Test booking with a valid date, time, doctor, patient name and phone number.
- Test cancellation using the phone number associated with a confirmed appointment.
- Test duplicate-slot prevention by attempting to book the same doctor/date/time twice.
- Confirm that dashboard data refreshes after booking or cancellation.
- Voice functionality depends on browser support and microphone permissions.

## Safety and Privacy Notes

- This project is a prototype for an assignment, not a production medical system.
- Do not use real patient or sensitive medical information during demonstrations.
- Before production use, add authentication, authorization, secure data handling, audit logging, stronger validation, backups, and appropriate privacy/security controls.

## Author / Assignment

Built as an SDE internship assignment: **Voice AI Doctor Appointment Assistant**.

---

*Update this README with screenshots, repository details, and any environment-specific configuration before publishing.*
