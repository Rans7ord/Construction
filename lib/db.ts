import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'turntable.proxy.rlwy.net',
  port: parseInt(process.env.DB_PORT || '34127'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'sEFolfUJSNCFNLmmQQzhhwcgzzUHYYBz',
  database: process.env.DB_NAME || 'railway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(sql, params || []);
    return rows as T[];
  } finally {
    connection.release();
  }
}

export async function execute<T = any>(
  sql: string,
  params?: any[]
): Promise<T> {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(sql, params || []);
    return result as T;
  } finally {
    connection.release();
  }
}

export async function queryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

export async function getUserByEmail(email: string) {
  return queryOne(
    'SELECT id, name, email, role, company_id FROM users WHERE email = ?',
    [email]
  );
}

export async function verifyPassword(email: string, password: string) {
  const user = await queryOne<any>(
    'SELECT id, name, email, password, role, company_id FROM users WHERE email = ?',
    [email]
  );
  
  if (!user) return null;
  
  // This requires bcrypt package - will be handled in auth middleware
  return user;
}

export default pool;
