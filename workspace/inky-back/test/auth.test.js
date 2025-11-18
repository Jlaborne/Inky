jest.mock('../src/middleware/firebaseAdmin', () => {
  const users = new Map();

  const admin = function () {};
  admin.apps = [];
  admin.initializeApp = () => { admin.apps.push({}); };
  admin.credential = { cert: () => ({}) };
  admin.auth = () => ({
    createUser: async ({ email, password }) => {
      if ([...users.values()].some(u => u.email === email)) {
        const err = new Error('auth/email-already-exists');
        err.code = 'auth/email-already-exists';
        throw err;
      }
      const uid = `uid_${Math.random().toString(36).slice(2,10)}`;
      const record = { uid, email, password };
      users.set(uid, record);
      return record;
    },
    getUserByEmail: async (email) => {
      const found = [...users.values()].find(u => u.email === email);
      if (!found) { const e = new Error('auth/user-not-found'); e.code = 'auth/user-not-found'; throw e; }
      return found;
    },
    deleteUser: async (uid) => { users.delete(uid); },
    verifyIdToken: async () => ({ uid: 'test-uid', admin: false }),
  });

  return admin;
});

jest.mock('../src/middleware/authenticateToken', () => {
  return () => (req, res, next) => next();
});

const request = require('supertest');
const app = require('../server');
const { pool } = require('../src/db/pool');

describe('Authentication API Tests', () => {
  const baseUser = {
    email: 'testuser4@example.com',
    password: 'password123',
    lastName: 'Doe',
    firstName: 'John',
    role: 'tattoo',
  };

  beforeEach(async () => {
  await pool.query('DELETE FROM users WHERE email = $1', [baseUser.email]);
});

afterAll(async () => {
  await pool.end();
})

  it('201 -> crée un nouvel utilisateur', async () => {
    const res = await request(app).post('/auth/register').send(baseUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [baseUser.email]);
    expect(rows[0]).toMatchObject({
      email: baseUser.email,
      last_name: baseUser.lastName,
      first_name: baseUser.firstName,
      role: baseUser.role,
    });
  });

  it('400 -> email en doublon', async () => {
    await request(app).post('/auth/register').send(baseUser);
    const res = await request(app).post('/auth/register').send(baseUser);
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Email already in use');
  });

  it('400 -> validation: mot de passe trop court', async () => {
    const bad = { ...baseUser, email: 'short@example.com', password: '123' };
    const res = await request(app).post('/auth/register').send(bad);
    expect(res.statusCode).toBe(400);
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.some(e => /Password/i.test(e.msg))).toBe(true);
  });

  it('400 -> validation: email invalide', async () => {
    const bad = { ...baseUser, email: 'not-an-email' };
    const res = await request(app).post('/auth/register').send(bad);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors?.some(e => /Email/i.test(e.msg))).toBe(true);
  });
});
