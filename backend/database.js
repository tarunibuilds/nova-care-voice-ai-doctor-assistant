
const Database = require("better-sqlite3");

const db = new Database("nova-care.db");

// Create appointments table
db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient TEXT NOT NULL,
    phone TEXT,
    doctor TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'Confirmed'
  )
`);

// Add phone column to existing database if missing
const columns = db.prepare("PRAGMA table_info(appointments)").all();

if (!columns.some((column) => column.name === "phone")) {
  db.exec("ALTER TABLE appointments ADD COLUMN phone TEXT");
}

// Create doctors table
db.exec(`
  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    available INTEGER DEFAULT 1
  )
`);

module.exports = db;
