-- Create petty_cash table for managing inflows and outflows
CREATE TABLE IF NOT EXISTS petty_cash (
  id VARCHAR(50) PRIMARY KEY,
  amount DECIMAL(15, 2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  vendor VARCHAR(255),
  type ENUM('inflow', 'outflow') NOT NULL,
  date DATE NOT NULL,
  added_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (added_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_date (date),
  INDEX idx_type (type),
  INDEX idx_category (category),
  INDEX idx_vendor (vendor),
  INDEX idx_added_by (added_by)
);
