import pgp from 'pg-promise';

import dotenv from 'dotenv';
dotenv.config();

export const pgPromise = pgp({
  capSQL: true,
});
const pg = pgPromise({
  host: process.env.HOST_POSTGRESQL ?? 'localhost',
  port: process.env.PORT_POSTGRESQL
    ? Number(process.env.PORT_POSTGRESQL)
    : 5432,
  user: process.env.USER_POSTGRESQL || 'postgres',
  password: process.env.PASSWORD_POSTGRESQL || 'postgres',
  database: process.env.DATABASE_POSTGRESQL || 'pulpo_db',
});

export default pg;
