import pg from 'pg';
import 'dotenv/config';
const {Pool} = pg;

let localPoolConfig = {
    user: 'postgres',
    password: '1234',
    host: 'localhost',
    port: 5432,
    database: 'tododb'
};

const poolConfig = process.env.DATABASE_URL ? {connectionString: process.env.DATABASE_URL,ssl: { rejectUnauthorized: false }} : localPoolConfig;

const pool = new Pool(poolConfig);

export default pool;