import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'server123.hostingprovider.com',
  user: process.env.DB_USER || 'tertrac2_dbuser',
  password: process.env.DB_PASS || '1Longp@ssword',
  database: process.env.DB_NAME || 'tertrac2_constructionManager',
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
