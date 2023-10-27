import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'nityshyn'
});

export default async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}