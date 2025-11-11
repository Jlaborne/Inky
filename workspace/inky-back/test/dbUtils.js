const { pool } = require('../src/db/pool');

beforeEach(async () => { await pool.query('BEGIN'); });
afterEach(async () => { await pool.query('ROLLBACK'); });
afterAll(async () => { await pool.end(); });