DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'superadmin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cert_type') THEN
    CREATE TYPE cert_type AS ENUM ('certificado', 'constancia');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  dni VARCHAR(20) UNIQUE,
  email VARCHAR(200),
  role user_role DEFAULT 'user',
  active BOOLEAN DEFAULT true,
  has_logged_in BOOLEAN NOT NULL DEFAULT false,
  first_login_at TIMESTAMP,
  invited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(300) NOT NULL,
  description TEXT,
  hours INTEGER NOT NULL DEFAULT 1,
  instructor VARCHAR(200),
  created_by INTEGER REFERENCES users(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  type cert_type NOT NULL DEFAULT 'certificado',
  verification_code VARCHAR(20) UNIQUE NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  hours INTEGER NOT NULL,
  issued_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_certificates_course ON certificates(course_id);
