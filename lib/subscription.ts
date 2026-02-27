// lib/subscription.ts
import { query, queryOne } from '@/lib/db';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Plan {
  id: string;
  name: string;
  price: number;
  maxProjects: number; // 0 = unlimited
  maxUsers: number;    // 0 = unlimited
  features: PlanFeatures;
  isActive: boolean;
}

export interface PlanFeatures {
  budgetTracking: boolean;
  expenseManagement: boolean;
  reports: boolean;
  excelExport: boolean;
  rolePermissions: boolean;
  prioritySupport: boolean;
  pettyCash: boolean;
  materialRequisitions: boolean;
}

export interface Subscription {
  id: string;
  companyId: string;
  planId: string;
  status: 'trialing' | 'active' | 'expired' | 'cancelled' | 'past_due';
  trialStartsAt: string | null;
  trialEndsAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  paystackCustomerCode: string | null;
  paystackSubCode: string | null;
  plan?: Plan;
}

export interface SubscriptionStatus {
  isActive: boolean;
  isTrial: boolean;
  isExpired: boolean;
  daysLeftInTrial: number;
  subscription: Subscription | null;
  plan: Plan | null;
}

// ── Row → Plan mapper ─────────────────────────────────────────────────────────

function rowToPlan(r: any): Plan {
  return {
    id: r.id ?? r.plan_id,
    name: r.name ?? r.plan_name,
    price: Number(r.price ?? r.plan_price ?? 0),
    maxProjects: Number(r.max_projects ?? 0),
    maxUsers: Number(r.max_users ?? 0),
    features:
      typeof r.features === 'string'
        ? JSON.parse(r.features)
        : (r.features ?? {}),
    isActive: Boolean(r.is_active ?? 1),
  };
}

// ── Get subscription with plan for a company ──────────────────────────────────

export async function getSubscription(companyId: string): Promise<Subscription | null> {
  const row = await queryOne<any>(
    `SELECT s.*,
            p.name       AS plan_name,
            p.price      AS plan_price,
            p.max_projects,
            p.max_users,
            p.features,
            p.is_active
     FROM   subscriptions s
     JOIN   plans p ON s.plan_id = p.id
     WHERE  s.company_id = ?`,
    [companyId]
  );

  if (!row) return null;

  return {
    id: row.id,
    companyId: row.company_id,
    planId: row.plan_id,
    status: row.status,
    trialStartsAt: row.trial_starts_at ?? null,
    trialEndsAt: row.trial_ends_at ?? null,
    currentPeriodStart: row.current_period_start ?? null,
    currentPeriodEnd: row.current_period_end ?? null,
    paystackCustomerCode: row.paystack_customer_code ?? null,
    paystackSubCode: row.paystack_sub_code ?? null,
    plan: rowToPlan(row),
  };
}

// ── Evaluate subscription health ──────────────────────────────────────────────

export async function getSubscriptionStatus(companyId: string): Promise<SubscriptionStatus> {
  const sub = await getSubscription(companyId);

  if (!sub) {
    return {
      isActive: false,
      isTrial: false,
      isExpired: true,
      daysLeftInTrial: 0,
      subscription: null,
      plan: null,
    };
  }

  const now = new Date();

  if (sub.status === 'trialing') {
    const trialEnd = sub.trialEndsAt ? new Date(sub.trialEndsAt) : null;
    const msLeft   = trialEnd ? trialEnd.getTime() - now.getTime() : 0;
    const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    const isActive = daysLeft > 0;

    return {
      isActive,
      isTrial: true,
      isExpired: !isActive,
      daysLeftInTrial: daysLeft,
      subscription: sub,
      plan: sub.plan ?? null,
    };
  }

  if (sub.status === 'active') {
    const periodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
    const isActive  = !periodEnd || periodEnd > now;
    return {
      isActive,
      isTrial: false,
      isExpired: !isActive,
      daysLeftInTrial: 0,
      subscription: sub,
      plan: sub.plan ?? null,
    };
  }

  // cancelled / past_due / expired
  return {
    isActive: false,
    isTrial: false,
    isExpired: true,
    daysLeftInTrial: 0,
    subscription: sub,
    plan: sub.plan ?? null,
  };
}

// ── Feature / limit checks ────────────────────────────────────────────────────

export async function canCreateProject(
  companyId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const status     = await getSubscriptionStatus(companyId);

  if (!status.isActive) {
    return { allowed: false, reason: 'Your subscription has expired. Please upgrade to continue.' };
  }

  const maxProjects = status.plan?.maxProjects ?? 3;
  if (maxProjects === 0) return { allowed: true }; // 0 = unlimited

  const rows  = await query<any>('SELECT COUNT(*) AS cnt FROM projects WHERE company_id = ?', [companyId]);
  const count = Number(rows[0]?.cnt ?? 0);

  if (count >= maxProjects) {
    return {
      allowed: false,
      reason: `Your ${status.plan?.name} plan allows up to ${maxProjects} projects. Upgrade to add more.`,
    };
  }

  return { allowed: true };
}

export async function canAddUser(
  companyId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const status  = await getSubscriptionStatus(companyId);

  if (!status.isActive) {
    return { allowed: false, reason: 'Your subscription has expired. Please upgrade to continue.' };
  }

  const maxUsers = status.plan?.maxUsers ?? 2;
  if (maxUsers === 0) return { allowed: true }; // 0 = unlimited

  const rows  = await query<any>('SELECT COUNT(*) AS cnt FROM users WHERE company_id = ?', [companyId]);
  const count = Number(rows[0]?.cnt ?? 0);

  if (count >= maxUsers) {
    return {
      allowed: false,
      reason: `Your ${status.plan?.name} plan allows up to ${maxUsers} users. Upgrade to add more.`,
    };
  }

  return { allowed: true };
}

export async function canUseFeature(
  companyId: string,
  feature: keyof PlanFeatures
): Promise<{ allowed: boolean; reason?: string }> {
  const status = await getSubscriptionStatus(companyId);

  if (!status.isActive) {
    return { allowed: false, reason: 'Your subscription has expired.' };
  }

  const allowed = status.plan?.features?.[feature] ?? false;
  if (!allowed) {
    return {
      allowed: false,
      reason: `This feature is not available on the ${status.plan?.name} plan. Please upgrade.`,
    };
  }

  return { allowed: true };
}

// ── Create 15-day trial for a new company ─────────────────────────────────────

export async function createTrialSubscription(companyId: string): Promise<void> {
  const { execute } = await import('@/lib/db');
  const { v4: uuidv4 } = await import('uuid');

  const now      = new Date();
  const trialEnd = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
  const fmt      = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ');

  await execute(
    `INSERT INTO subscriptions
       (id, company_id, plan_id, status, trial_starts_at, trial_ends_at)
     VALUES (?, ?, 'plan_starter', 'trialing', ?, ?)`,
    [uuidv4(), companyId, fmt(now), fmt(trialEnd)]
  );
}

// ── Activate paid subscription after successful Paystack payment ───────────────

export async function activatePaidSubscription(
  companyId: string,
  planId: string,
  paystackCustomerCode?: string,
  paystackSubCode?: string
): Promise<void> {
  const { execute } = await import('@/lib/db');

  const now       = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const fmt       = (d: Date) => d.toISOString().slice(0, 19).replace('T', ' ');

  await execute(
    `UPDATE subscriptions
     SET  plan_id                = ?,
          status                 = 'active',
          current_period_start   = ?,
          current_period_end     = ?,
          paystack_customer_code = ?,
          paystack_sub_code      = ?,
          updated_at             = CURRENT_TIMESTAMP
     WHERE company_id = ?`,
    [planId, fmt(now), fmt(periodEnd), paystackCustomerCode ?? null, paystackSubCode ?? null, companyId]
  );
}

// ── Fetch all active plans ────────────────────────────────────────────────────

export async function getPlans(): Promise<Plan[]> {
  const rows = await query<any>(
    'SELECT * FROM plans WHERE is_active = 1 ORDER BY price ASC'
  );
  return rows.map(rowToPlan);
}