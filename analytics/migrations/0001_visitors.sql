CREATE TABLE IF NOT EXISTS visitor_totals (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  visits INTEGER NOT NULL DEFAULT 0 CHECK (visits >= 0)
);
INSERT OR IGNORE INTO visitor_totals (id, visits) VALUES (1, 0);

CREATE TABLE IF NOT EXISTS visitor_places (
  bucket TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  lat REAL NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lon REAL NOT NULL CHECK (lon BETWEEN -180 AND 180),
  visits INTEGER NOT NULL DEFAULT 0 CHECK (visits >= 0)
);
CREATE INDEX IF NOT EXISTS visitor_places_ranking ON visitor_places (visits DESC, bucket ASC);
