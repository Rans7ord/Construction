-- ============================================================
-- WORKFIELD CONSTRUCTION — COMPLETE DATABASE
-- Matches live Railway MySQL 9.4.0 schema as of 2026-03-02
-- Safe to run fresh: uses IF NOT EXISTS + INSERT IGNORE
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ── plans ─────────────────────────────────────────────────────────────────────
-- Must exist before subscriptions and payment_transactions (FK targets)
CREATE TABLE IF NOT EXISTS `plans` (
  `id`           varchar(50)    COLLATE utf8mb4_unicode_ci NOT NULL,
  `name`         varchar(100)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `price`        decimal(10,2)  NOT NULL,          -- Monthly price in GHS
  `max_projects` int            NOT NULL DEFAULT 0, -- 0 = unlimited
  `max_users`    int            NOT NULL DEFAULT 0, -- 0 = unlimited
  `features`     json           NOT NULL,
  `is_active`    tinyint(1)     NOT NULL DEFAULT 1,
  `created_at`   timestamp      NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed the three plans (INSERT IGNORE = safe to re-run)
INSERT IGNORE INTO `plans` (`id`, `name`, `price`, `max_projects`, `max_users`, `features`) VALUES
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

-- ── users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`                varchar(50)  COLLATE utf8mb4_unicode_ci NOT NULL,
  `name`              varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email`             varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password`          varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role`              enum('admin','supervisor','staff') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'staff',
  `company_id`        varchar(50)  COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at`        timestamp    NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        timestamp    NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `email_verified`    tinyint(1)   DEFAULT 0,
  `email_verified_at` datetime     DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── projects ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `projects` (
  `id`           varchar(50)    COLLATE utf8mb4_unicode_ci NOT NULL,
  `name`         varchar(255)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `location`     varchar(255)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `description`  text           COLLATE utf8mb4_unicode_ci,
  `client_name`  varchar(255)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `client_email` varchar(255)   COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date`   date           NOT NULL,
  `end_date`     date           NOT NULL,
  `total_budget` decimal(15,2)  NOT NULL,
  `created_by`   varchar(50)    COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at`   timestamp      NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   timestamp      NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status`       enum('active','completed','paused') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `company_id`   varchar(50)    COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_projects_company` (`company_id`),
  KEY `idx_projects_created_by` (`created_by`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── project_steps ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `project_steps` (
  `id`               varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id`       varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `name`             varchar(255)  COLLATE utf8mb4_unicode_ci NOT NULL,
  `description`      text          COLLATE utf8mb4_unicode_ci,
  `estimated_budget` decimal(15,2) NOT NULL,
  `order`            int           NOT NULL,
  `status`           enum('pending','in-progress','completed') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at`       timestamp     NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       timestamp     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_steps_project` (`project_id`),
  CONSTRAINT `project_steps_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── expenses ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `expenses` (
  `id`          varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id`  varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `step_id`     varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount`      decimal(15,2) NOT NULL,
  `description` varchar(255)  COLLATE utf8mb4_unicode_ci NOT NULL,
  `date`        date          NOT NULL,
  `category`    varchar(100)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vendor`      varchar(255)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receipt`     varchar(255)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by`  varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at`  timestamp     NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  timestamp     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_expenses_project` (`project_id`),
  KEY `idx_expenses_step` (`step_id`),
  KEY `idx_expenses_created_by` (`created_by`),
  CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`step_id`)    REFERENCES `project_steps` (`id`) ON DELETE CASCADE,
  CONSTRAINT `expenses_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── materials ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `materials` (
  `id`          varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id`  varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `step_id`     varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `name`        varchar(255)  COLLATE utf8mb4_unicode_ci NOT NULL,
  `type`        varchar(100)  COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity`    decimal(10,2) NOT NULL,
  `unit`        varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text          COLLATE utf8mb4_unicode_ci,
  `status`      enum('pending','ordered','received','used') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at`  timestamp     NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  timestamp     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_materials_project` (`project_id`),
  KEY `idx_materials_step` (`step_id`),
  CONSTRAINT `materials_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `materials_ibfk_2` FOREIGN KEY (`step_id`)    REFERENCES `project_steps` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── money_in ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `money_in` (
  `id`          varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `project_id`  varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount`      decimal(15,2) NOT NULL,
  `description` varchar(255)  COLLATE utf8mb4_unicode_ci NOT NULL,
  `date`        date          NOT NULL,
  `reference`   varchar(255)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at`  timestamp     NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  timestamp     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_money_in_project` (`project_id`),
  CONSTRAINT `money_in_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── petty_cash ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `petty_cash` (
  `id`          varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount`      decimal(15,2) NOT NULL,
  `description` varchar(255)  COLLATE utf8mb4_unicode_ci NOT NULL,
  `category`    varchar(100)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vendor`      varchar(255)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type`        enum('inflow','outflow') COLLATE utf8mb4_unicode_ci NOT NULL,
  `date`        date          NOT NULL,
  `added_by`    varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id`  varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at`  timestamp     NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  timestamp     NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_date`              (`date`),
  KEY `idx_type`              (`type`),
  KEY `idx_category`          (`category`),
  KEY `idx_vendor`            (`vendor`),
  KEY `idx_added_by`          (`added_by`),
  KEY `idx_petty_cash_company`(`company_id`),
  CONSTRAINT `petty_cash_ibfk_1` FOREIGN KEY (`added_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── subscriptions ─────────────────────────────────────────────────────────────
-- One row per company. company_id is UNIQUE.
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id`                     varchar(50)  COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id`             varchar(50)  COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan_id`                varchar(50)  COLLATE utf8mb4_unicode_ci NOT NULL,
  `status`                 enum('trialing','active','cancelled','expired','past_due')
                           COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'trialing',
  `trial_starts_at`        datetime     NOT NULL,
  `trial_ends_at`          datetime     NOT NULL,
  `current_period_start`   datetime     DEFAULT NULL,
  `current_period_end`     datetime     DEFAULT NULL,
  `paystack_customer_code` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paystack_sub_code`      varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at`             timestamp    NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`             timestamp    NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `company_id`    (`company_id`),
  KEY `idx_sub_company`      (`company_id`),
  KEY `idx_sub_status`       (`status`),
  KEY `plan_id`              (`plan_id`),
  CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── payment_transactions ──────────────────────────────────────────────────────
-- NOTE: company_id has NO foreign key — it holds a company UUID, not a user id.
-- The original migration had a wrong FK to users(id) which caused 500 errors
-- on every Subscribe click. That FK has been permanently dropped.
CREATE TABLE IF NOT EXISTS `payment_transactions` (
  `id`           varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `company_id`   varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,  -- no FK (intentional)
  `plan_id`      varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `paystack_ref` varchar(100)  COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount`       decimal(10,2) NOT NULL,                              -- GHS (not pesewas)
  `status`       enum('pending','success','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `paid_at`      datetime      DEFAULT NULL,
  `created_at`   timestamp     NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `paystack_ref`  (`paystack_ref`),
  KEY `idx_txn_company`      (`company_id`),
  KEY `idx_txn_ref`          (`paystack_ref`),
  KEY `idx_txn_status`       (`status`),
  KEY `plan_id`              (`plan_id`),
  CONSTRAINT `payment_transactions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── subscription_queue ────────────────────────────────────────────────────────
-- Holds upcoming plan changes (e.g. upgrade queued for next billing cycle)
CREATE TABLE IF NOT EXISTS `subscription_queue` (
  `id`           varchar(36)  NOT NULL,
  `company_id`   varchar(36)  NOT NULL,
  `plan_id`      varchar(50)  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `months`       int          NOT NULL DEFAULT 1,
  `starts_at`    datetime     NOT NULL,
  `ends_at`      datetime     NOT NULL,
  `paystack_ref` varchar(100) DEFAULT NULL,
  `status`       enum('pending','active','cancelled') NOT NULL DEFAULT 'pending',
  `created_at`   datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_queue_company`   (`company_id`),
  KEY `idx_queue_starts_at` (`starts_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ── email_verifications ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `email_verifications` (
  `id`         varchar(36)  NOT NULL,
  `user_id`    varchar(50)  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp_hash`   varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime     NOT NULL,
  `attempts`   int          DEFAULT 0,
  `used_at`    datetime     DEFAULT NULL,
  `created_at` datetime     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `email_verifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── password_resets ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id`         varchar(36)  NOT NULL,
  `user_id`    varchar(50)  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime     NOT NULL,
  `used_at`    datetime     DEFAULT NULL,
  `created_at` datetime     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- END OF SCHEMA
-- ============================================================