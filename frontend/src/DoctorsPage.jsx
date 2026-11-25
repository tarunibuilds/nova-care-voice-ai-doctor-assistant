import { useState } from "react";
import { Plus, Search, Stethoscope, Trash2, X } from "lucide-react";

function DoctorsPage() {
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: "Dr. Meera Sharma",
      specialty: "General Physician",
      phone: "9876543210",
      status: "Available",
    },
    {
      id: 2,
      name: "Dr. Arjun Rao",
      specialty: "Cardiologist",
      phone: "9876543211",
      status: "Available",
    },
    {
      id: 3,
      name: "Dr. Sana Ali",
      specialty: "Dermatologist",
      phone: "9876543212",
      status: "Unavailable",
    },
  ]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialty: "",
    phone: "",
  });

  const handleAddDoctor = (e) => {
    e.preventDefault();

    const doctor = {
      id: Date.now(),
      name: newDoctor.name,
      specialty: newDoctor.specialty,
      phone: newDoctor.phone,
      status: "Available",
    };

    setDoctors((prev) => [...prev, doctor]);

    setNewDoctor({
      name: "",
      specialty: "",
      phone: "",
    });

    setShowForm(false);
  };

  const handleDeleteDoctor = (id) => {
    setDoctors((prev) => prev.filter((doctor) => doctor.id !== id));
  };

  const toggleStatus = (id) => {
    setDoctors((prev) =>
      prev.map((doctor) =>
        doctor.id === id
          ? {
              ...doctor,
              status:
                doctor.status === "Available"
                  ? "Unavailable"
                  : "Available",
            }
          : doctor
      )
    );
  };

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(search.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="doctors-page">
      <div className="doctors-header">
        <div>
          <span className="eyebrow">
            <span className="live-dot" /> MEDICAL TEAM
          </span>

          <h2>Doctors</h2>
          <p>Manage your clinic's doctors and availability.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={17} />
          Add Doctor
        </button>
      </div>

      <div className="doctors-search">
        <Search size={18} />

        <input
          type="text"
          placeholder="Search doctor or specialty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="doctors-summary">
        <div className="doctor-summary-card">
          <span>Total Doctors</span>
          <h3>{doctors.length}</h3>
        </div>

        <div className="doctor-summary-card">
          <span>Available</span>
          <h3>
            {doctors.filter((d) => d.status === "Available").length}
          </h3>
        </div>

        <div className="doctor-summary-card">
          <span>Unavailable</span>
          <h3>
            {doctors.filter((d) => d.status === "Unavailable").length}
          </h3>
        </div>
      </div>

      <div className="doctors-grid">
        {filteredDoctors.map((doctor) => (
          <div className="doctor-management-card" key={doctor.id}>
            <div className="doctor-management-top">
              <div className="doctor-management-avatar">
                <Stethoscope size={24} />
              </div>

              <span
                className={`doctor-management-status ${
                  doctor.status === "Available"
                    ? "available"
                    : "unavailable"
                }`}
              >
                {doctor.status}
              </span>
            </div>

            <h3>{doctor.name}</h3>
            <p className="doctor-specialty">{doctor.specialty}</p>

            <div className="doctor-contact">
              <span>Phone</span>
              <strong>{doctor.phone}</strong>
            </div>

            <div className="doctor-card-actions">
              <button
                className="doctor-toggle-button"
                onClick={() => toggleStatus(doctor.id)}
              >
                {doctor.status === "Available"
                  ? "Mark Unavailable"
                  : "Mark Available"}
              </button>

              <button
                className="doctor-delete-button"
                onClick={() => handleDeleteDoctor(doctor.id)}
                title="Delete doctor"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="doctors-empty">
          <Stethoscope size={35} />
          <h3>No doctors found</h3>
          <p>Try searching with another name or specialty.</p>
        </div>
      )}

      {showForm && (
        <div className="doctor-modal-overlay">
          <div className="doctor-modal">
            <div className="doctor-modal-header">
              <div>
                <h3>Add New Doctor</h3>
                <p>Enter the doctor's information below.</p>
              </div>

              <button
                className="doctor-modal-close"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddDoctor}>
              <label>Doctor Name</label>
              <input
                type="text"
                placeholder="Dr. Full Name"
                value={newDoctor.name}
                onChange={(e) =>
                  setNewDoctor({
                    ...newDoctor,
                    name: e.target.value,
                  })
                }
                required
              />

              <label>Specialty</label>
              <input
                type="text"
                placeholder="e.g. Cardiologist"
                value={newDoctor.specialty}
                onChange={(e) =>
                  setNewDoctor({
                    ...newDoctor,
                    specialty: e.target.value,
                  })
                }
                required
              />

              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={newDoctor.phone}
                onChange={(e) =>
                  setNewDoctor({
                    ...newDoctor,
                    phone: e.target.value,
                  })
                }
                required
              />

              <div className="doctor-form-actions">
                <button
                  type="button"
                  className="doctor-cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <Plus size={17} />
                  Add Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorsPage;