CREATE TABLE achievements (
  id INTEGER AUTOINCREMENT,
  imageid INTEGER,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  whengot TIME,
  rare VARCHAR,
  expreward FLOAT DEFAULT 0.0
);
