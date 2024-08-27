import { User } from '../../utils/interfaces/user';
import pool from '../db/db';

export const postNewUser = async (user: User) => {
  try {
    let client = await pool.connect();
    const query = `
      INSERT INTO user_pulpo (first_name, last_name, email, password, phone, company_name, company_address, country, role, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const values = [
      user.first_name,
      user.last_name,
      user.email,
      user.password,
      user.phone,
      user.company_name,
      user.company_address,
      user.country,
      user.role,
      user.status,
    ];
    const result = await client.query<User>(query, values);
    client.release();

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};
