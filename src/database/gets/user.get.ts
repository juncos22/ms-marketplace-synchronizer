import { User } from '../../utils/interfaces/user';
import pool from '../db/db';

export const getUser = async (id: string) => {
  //Validar que el id sea un string que no genere SQL Injection
  let client;
  try {
    client = await pool.connect();
    const { rows } = await client.query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );
    return rows[0];
  } catch (error) {
    throw error;
  } finally {
    //no se olvideeeeen
    await client?.release();
  }
};

export default getUser;
