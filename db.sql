-- Construction Manager Database Setup
-- Run this script in any MySQL client connected to your Railway database

-- Drop existing tables if they exist (in reverse order due to foreign keys)
DROP TABLE IF EXISTS materials;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS money_in;
DROP TABLE IF EXISTS project_steps;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'supervisor', 'staff') NOT NULL DEFAULT 'staff',
  company_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_company_id (company_id),
  INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create projects table
CREATE TABLE projects (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_budget DECIMAL(15, 2) NOT NULL,
  created_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('active', 'completed', 'paused') DEFAULT 'active',
  company_id VARCHAR(50) NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_projects_company (company_id),
  INDEX idx_projects_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create project_steps table
CREATE TABLE project_steps (
  id VARCHAR(50) PRIMARY KEY,
  project_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  estimated_budget DECIMAL(15, 2) NOT NULL,
  `order` INT NOT NULL,
  status ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_steps_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create money_in table
CREATE TABLE money_in (
  id VARCHAR(50) PRIMARY KEY,
  project_id VARCHAR(50) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_money_in_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create expenses table
CREATE TABLE expenses (
  id VARCHAR(50) PRIMARY KEY,
  project_id VARCHAR(50) NOT NULL,
  step_id VARCHAR(50) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  category VARCHAR(100),
  vendor VARCHAR(255),
  receipt VARCHAR(255),
  created_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (step_id) REFERENCES project_steps(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_expenses_project (project_id),
  INDEX idx_expenses_step (step_id),
  INDEX idx_expenses_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create materials table
CREATE TABLE materials (
  id VARCHAR(50) PRIMARY KEY,
  project_id VARCHAR(50) NOT NULL,
  step_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  description TEXT,
  status ENUM('pending', 'ordered', 'received', 'used') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (step_id) REFERENCES project_steps(id) ON DELETE CASCADE,
  INDEX idx_materials_project (project_id),
  INDEX idx_materials_step (step_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create petty cash table
CREATE TABLE IF NOT EXISTS petty_cash (
  id VARCHAR(50) PRIMARY KEY,
  amount DECIMAL(15, 2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  vendor VARCHAR(255),
  type ENUM('inflow', 'outflow') NOT NULL,
  date DATE NOT NULL,
  added_by VARCHAR(50) NOT NULL,
  company_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_date (date),
  INDEX idx_type (type),
  INDEX idx_category (category),
  INDEX idx_vendor (vendor),
  INDEX idx_added_by (added_by),
  INDEX idx_petty_cash_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- SUBSCRIPTION SYSTEM MIGRATION
-- Run this AFTER your existing db.sql has been applied.
-- It adds: plans, subscriptions, payment_transactions
-- ============================================================

-- ── Plans table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plans (
  id          VARCHAR(50)     PRIMARY KEY,
  name        VARCHAR(100)    NOT NULL,
  price       DECIMAL(10, 2)  NOT NULL,          -- Monthly price in GHS
  max_projects INT            NOT NULL DEFAULT 0, -- 0 = unlimited
  max_users    INT            NOT NULL DEFAULT 0, -- 0 = unlimited
  features    JSON            NOT NULL,           -- {"reports":true,"excel":true,"petty_cash":true,"roles":true}
  is_active   TINYINT(1)      NOT NULL DEFAULT 1,
  created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Seed the three plans ──────────────────────────────────────
INSERT INTO plans (id, name, price, max_projects, max_users, features) VALUES
(
  'plan_starter',
  'Starter',
  249.00,
  3,
  2,
  '{"reports":false,"excel":false,"petty_cash":false,"roles":false}'
),
(
  'plan_professional',
  'Professional',
  649.00,
  10,
  0,
  '{"reports":true,"excel":true,"petty_cash":true,"roles":false}'
),
(
  'plan_enterprise',
  'Enterprise',
  1850.00,
  0,
  0,
  '{"reports":true,"excel":true,"petty_cash":true,"roles":true}'
);

-- ── Subscriptions table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    VARCHAR(50)   PRIMARY KEY,
  company_id            VARCHAR(50)   NOT NULL UNIQUE,
  plan_id               VARCHAR(50)   NOT NULL,
  status                ENUM(
                          'trialing',
                          'active',
                          'cancelled',
                          'expired',
                          'past_due'
                        )             NOT NULL DEFAULT 'trialing',
  trial_starts_at       DATETIME      NOT NULL,
  trial_ends_at         DATETIME      NOT NULL,
  current_period_start  DATETIME      NULL,
  current_period_end    DATETIME      NULL,
  paystack_customer_code VARCHAR(100) NULL,
  paystack_sub_code     VARCHAR(100)  NULL,
  created_at            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES plans(id),
  INDEX idx_sub_company  (company_id),
  INDEX idx_sub_status   (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Payment transactions table ────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_transactions (
  id              VARCHAR(50)   PRIMARY KEY,
  company_id      VARCHAR(50)   NOT NULL,
  plan_id         VARCHAR(50)   NOT NULL,
  paystack_ref    VARCHAR(100)  NOT NULL UNIQUE,
  amount          DECIMAL(10,2) NOT NULL,          -- Amount in GHS
  status          ENUM(
                    'pending',
                    'success',
                    'failed'
                  )             NOT NULL DEFAULT 'pending',
  paid_at         DATETIME      NULL,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE CASCADE,  -- links via company_id loosely
  FOREIGN KEY (plan_id)    REFERENCES plans(id),
  INDEX idx_txn_company    (company_id),
  INDEX idx_txn_ref        (paystack_ref),
  INDEX idx_txn_status     (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify tables were created
SHOW TABLES;
