DROP TABLE IF EXISTS urls;

CREATE TABLE urls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_url TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  clicks INTEGER NOT NULL DEFAULT 0,
  encrypted_description TEXT NULL -- Added new column
  -- expiration_date TIMESTAMP NULL -- Optional: for future implementation
);

CREATE INDEX IF NOT EXISTS idx_short_code ON urls (short_code);
CREATE INDEX IF NOT EXISTS idx_original_url ON urls (original_url);