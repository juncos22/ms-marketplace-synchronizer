import pool from './db';

const connectToDatabase = async () => {
  try {
    await pool.connect();

    // Verificar si la extensión uuid-ossp ya está habilitada
    const {
      rows: [extensionExists],
    } = await pool.query(`
      SELECT EXISTS (
        SELECT 1
        FROM pg_extension
        WHERE extname = 'uuid-ossp'
      );`);

    // Habilitar uuid-ossp
    if (!extensionExists.exists) {
      await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
      console.log('uuid-ossp extension enabled');
    }

    // Para eliminar tabla puedes quitar comentario. Luego mantener comentado!
    // await pool.query('DROP TABLE product;');

    // Buscar tablas creadas
    const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE';
      `);
    const tables = result.rows.map((row: any) => row.table_name);

    // Crear tabla marketplace
    if (!tables.includes('marketplace')) {
      await pool.query(`
        CREATE TABLE marketplace (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL
        );`);
      console.log('marketplace table created');
    }

    // Crear tabla category_mk
    if (!tables.includes('category_mk')) {
      await pool.query(`
        CREATE TABLE category_mk (
          id VARCHAR(20) PRIMARY KEY,
          id_parent_category_mk VARCHAR(20),
          id_marketplace INT REFERENCES marketplace(id) NOT NULL,
          category_id_mk VARCHAR(50) UNIQUE,
          name VARCHAR(100) NOT NULL,
          meli_attributes TEXT[]
        );`);
      console.log('category_mk table created');
    }

    // Crear tabla attribute
    if (!tables.includes('attribute_mk')) {
      await pool.query(`
        CREATE TABLE attribute_mk (
          id SERIAL PRIMARY KEY,
          attribute_id TEXT,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          value_type VARCHAR(255),
           id_marketplace INT REFERENCES marketplace(id) NOT NULL
        );`);
      console.log('attribute_mk table created');
    }

    // Crear tabla category_mk_attribute
    if (!tables.includes('category_mk_attribute_mk')) {
      await pool.query(`
        CREATE TABLE category_mk_attribute_mk (
          id SERIAL PRIMARY KEY,
          id_category_mk VARCHAR(20) REFERENCES category_mk(id) NOT NULL,
          id_attribute_mk INT REFERENCES attribute_mk(id) NOT NULL,
          id_marketplace INT REFERENCES marketplace(id) NOT NULL
        );`);
      console.log('category_mk_attribute_mk table created');
    }

    // Crear tabla option
    if (!tables.includes('option')) {
      await pool.query(`
        CREATE TABLE option (
          id SERIAL PRIMARY KEY,
          value_name VARCHAR(255) NOT NULL,
          value_id VARCHAR(255),
          id_marketplace INT REFERENCES marketplace(id) NOT NULL
        );`);
      console.log('option table created');
    }
    // Crear tabla attribute_mk_option
    if (!tables.includes('attribute_mk_option')) {
      await pool.query(`
        CREATE TABLE attribute_mk_option (
           id SERIAL PRIMARY KEY,
           id_attribute_mk INT REFERENCES attribute_mk(id) NOT NULL,
           id_option INT REFERENCES option(id) NOT NULL,
           id_marketplace INT REFERENCES marketplace(id) NOT NULL
        );`);
      console.log('attribute_mk_option table created');
    }

    // Crear tabla category_pulpo
    if (!tables.includes('category_pulpo')) {
      await pool.query(`
        CREATE TABLE category_pulpo (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL
        );`);
      console.log('category_pulpo table created');
    }

    // Crear tabla category_pulpo_category_mk
    if (!tables.includes('category_pulpo_category_mk')) {
      await pool.query(`
        CREATE TABLE category_pulpo_category_mk (
          id SERIAL PRIMARY KEY,
          id_category_pulpo INT REFERENCES category_pulpo(id) NOT NULL,
          id_category_mk VARCHAR(20) REFERENCES category_mk(id) NOT NULL
        );`);
      console.log('category_pulpo_category_mk table created');
    }

    console.log(
      `Database is connected to ${process.env.HOST_POSTGRESQL}:${process.env.PORT_POSTGRESQL}`,
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error connecting to the database:', err.stack);
    } else {
      console.error('Unknown error:', err);
    }
  }
};

export const deleteTableData = async (
  table_name: string,
  id_marketplace?: number,
) => {
  const client = await pool.connect();
  try {
    let where = id_marketplace ? `WHERE id_marketplace = $1;` : ``;
    let query = `DELETE FROM ${table_name} ${where}`;
    let values = [];
    if (id_marketplace) {
      values.push(id_marketplace);
    }
    await client.query(query, values);
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export default connectToDatabase;
