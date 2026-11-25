
import { useState } from "react";
import AppointmentsPage from "./AppointmentsPage";
import DoctorsPage from "./DoctorsPage";
import AIReceptionistPage from "./AIReceptionistPage";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Phone,
  Bell,
  Search,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Activity,
  Stethoscope,
  Mic,
  MoreHorizontal,
  ChevronRight,
  Heart,
  UserRound,
} from "lucide-react";
import "./App.css";

const appointments = [
  {
    time: "09:00 AM",
    patient: "Ananya Reddy",
    doctor: "Dr. Meera Sharma",
    type: "General Consultation",
    status: "Confirmed",
    initials: "AR",
    color: "sage",
  },
  {
    time: "10:30 AM",
    patient: "Rahul Varma",
    doctor: "Dr. Arjun Rao",
    type: "Cardiology",
    status: "Checked in",
    initials: "RV",
    color: "peach",
  },
  {
    time: "11:15 AM",
    patient: "Priya Kapoor",
    doctor: "Dr. Meera Sharma",
    type: "Follow-up",
    status: "Confirmed",
    initials: "PK",
    color: "lavender",
  },
  {
    time: "12:00 PM",
    patient: "Karthik Nair",
    doctor: "Dr. Sana Ali",
    type: "Dermatology",
    status: "Pending",
    initials: "KN",
    color: "blue",
  },
];

const doctors = [
  {
    name: "Dr. Meera Sharma",
    specialty: "General Physician",
    initials: "MS",
    status: "Available",
    color: "sage",
  },
  {
    name: "Dr. Arjun Rao",
    specialty: "Cardiologist",
    initials: "AR",
    status: "In consultation",
    color: "peach",
  },
  {
    name: "Dr. Sana Ali",
    specialty: "Dermatologist",
    initials: "SA",
    status: "Available",
    color: "lavender",
  },
];

function App() {
  const [activePage, setActivePage] = useState("Overview");

  const renderPage = () => {
    switch (activePage) {
      case "Appointments":
        return <AppointmentsPage />;

      case "Doctors":
  return <DoctorsPage />;

      case "AI Receptionist":
  return <AIReceptionistPage />;

      default:
        return (
          <>
            <section className="welcome-section">
              <div>
                <span className="eyebrow">
                  <span className="live-dot" /> CLINIC OVERVIEW
                </span>
                <h2>
                  Good morning, Admin <span>✳</span>
                </h2>
                <p>Here's what's happening at your clinic today.</p>
              </div>

              <button
                className="primary-button"
                onClick={() => setActivePage("Appointments")}
              >
                <Plus size={17} /> New appointment
              </button>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-top">
                  <span>Today's appointments</span>
                  <div className="stat-icon green">
                    <CalendarDays size={18} />
                  </div>
                </div>
                <h3>24</h3>
                <p>
                  <span className="trend">↑ 12%</span> vs. yesterday
                </p>
                <div className="stat-bar">
                  <span style={{ width: "72%" }} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span>Active doctors</span>
                  <div className="stat-icon beige">
                    <Stethoscope size={18} />
                  </div>
                </div>
                <h3>
                  08 <small>/ 10</small>
                </h3>
                <p>
                  <span className="trend neutral">●</span> 8 doctors on duty
                </p>
                <div className="stat-bar">
                  <span style={{ width: "80%" }} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span>AI calls completed</span>
                  <div className="stat-icon peach">
                    <Phone size={18} />
                  </div>
                </div>
                <h3>36</h3>
                <p>
                  <span className="trend">↑ 18%</span> handled by NOVA
                </p>
                <div className="stat-bar">
                  <span style={{ width: "65%" }} />
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span>Patients checked in</span>
                  <div className="stat-icon lavender">
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <h3>
                  16 <small>/ 24</small>
                </h3>
                <p>
                  <span className="trend neutral">●</span> 8 still expected
                </p>
                <div className="stat-bar">
                  <span style={{ width: "60%" }} />
                </div>
              </div>
            </section>

            <section className="middle-grid">
              <div className="panel appointments-panel">
                <div className="panel-header">
                  <div>
                    <h3>Today's schedule</h3>
                    <p>Your upcoming patient appointments</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setActivePage("Appointments")}
                  >
                    View all <ArrowUpRight size={15} />
                  </button>
                </div>

                <div className="appointment-list">
                  {appointments.map((a, i) => (
                    <div className="appointment-row" key={i}>
                      <div className="appointment-time">
                        <Clock size={14} />
                        {a.time}
                      </div>

                      <div className={`patient-avatar ${a.color}`}>
                        {a.initials}
                      </div>

                      <div className="patient-details">
                        <strong>{a.patient}</strong>
                        <span>
                          {a.type} · {a.doctor}
                        </span>
                      </div>

                      <span
                        className={`status ${a.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {a.status}
                      </span>

                      <button className="dots-button">
                        <MoreHorizontal size={17} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="schedule-footer">
                  <Clock size={15} /> 8 more appointments scheduled today
                </div>
              </div>

              <div className="panel doctors-panel">
                <div className="panel-header">
                  <div>
                    <h3>Medical team</h3>
                    <p>Doctors on today's shift</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setActivePage("Doctors")}
                  >
                    View all <ArrowUpRight size={15} />
                  </button>
                </div>

                <div className="doctor-list">
                  {doctors.map((d, i) => (
                    <div className="doctor-row" key={i}>
                      <div className={`doctor-avatar ${d.color}`}>
                        <UserRound size={19} />
                      </div>

                      <div className="doctor-details">
                        <strong>{d.name}</strong>
                        <span>{d.specialty}</span>
                      </div>

                      <span
                        className={`doctor-status ${
                          d.status === "Available" ? "available" : "busy"
                        }`}
                      >
                        <span /> {d.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="doctor-footer">
                  <Activity size={15} /> 3 of 8 doctors shown
                </div>
              </div>
            </section>

            <section className="ai-card">
              <div className="ai-decoration">
                <div className="orb orb-one" />
                <div className="orb orb-two" />
              </div>

              <div className="ai-content">
                <div className="ai-tag">
                  <span className="ai-dot" /> NOVA AI RECEPTIONIST
                </div>

                <h3>
                  Your clinic's voice, <em>always ready.</em>
                </h3>

                <p>
                  Let NOVA handle incoming calls, answer patient questions and
                  schedule appointments — even after hours.
                </p>

                <button
                  className="ai-button"
                  onClick={() => setActivePage("AI Receptionist")}
                >
                  <Mic size={17} /> Start a voice call{" "}
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="ai-visual">
                <div className="voice-ring ring-outer" />
                <div className="voice-ring ring-middle" />
                <div className="voice-ring ring-inner" />
                <div className="voice-core">
                  <Phone size={26} />
                </div>

                <div className="voice-wave">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <span className="voice-caption">NOVA IS LISTENING</span>
              </div>
            </section>

            <footer className="footer">
              <span>© 2026 NOVA CARE</span>
              <span>
                Designed for better patient experiences <Heart size={12} />
              </span>
            </footer>
          </>
        );
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Heart size={21} />
          </div>
          <div>
            <h1>NOVA CARE</h1>
            <span>AI CLINIC ASSISTANT</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <nav className="navigation">
          <button
            className={`nav-item ${activePage === "Overview" ? "active" : ""}`}
            onClick={() => setActivePage("Overview")}
          >
            <LayoutDashboard size={18} /> Overview
          </button>

          <button
            className={`nav-item ${
              activePage === "Appointments" ? "active" : ""
            }`}
            onClick={() => setActivePage("Appointments")}
          >
            <CalendarDays size={18} /> Appointments
            <span className="nav-count">12</span>
          </button>

          <button
            className={`nav-item ${activePage === "Doctors" ? "active" : ""}`}
            onClick={() => setActivePage("Doctors")}
          >
            <Users size={18} /> Doctors
          </button>

          <button
            className={`nav-item ${
              activePage === "AI Receptionist" ? "active" : ""
            }`}
            onClick={() => setActivePage("AI Receptionist")}
          >
            <Phone size={18} /> AI Receptionist
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <Heart size={17} />
            </div>
            <h3>Care made simpler.</h3>
            <p>
              Let NOVA handle the busywork while you focus on patients.
            </p>
          </div>

          <div className="profile">
            <div className="profile-avatar">AD</div>
            <div className="profile-info">
              <strong>Admin Dashboard</strong>
              <span>Clinic Administrator</span>
            </div>
            <MoreHorizontal size={18} />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} /> <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <Search size={16} />
              <input placeholder="Search anything..." />
            </div>

            <button className="icon-button">
              <Bell size={18} />
              <span className="notification-dot" />
            </button>

            <div className="top-avatar">AD</div>
          </div>
        </header>

        <div className="content">{renderPage()}</div>
      </main>
    </div>
  );
}

export default App;
