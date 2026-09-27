-- Shared bookings table (already exists on shared D1 databases — IF NOT EXISTS makes this safe).
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  service TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  vehicle TEXT,
  address TEXT,
  notes TEXT,
  source TEXT,
  created_at TEXT,
  status TEXT DEFAULT 'Confirmed',
  reschedule_date TEXT,
  reschedule_time TEXT,
  notes2 TEXT,
  original_date TEXT,
  original_time TEXT,
  payment_status TEXT
);

CREATE INDEX IF NOT EXISTS idx_bookings_source_date ON bookings (source, date);
