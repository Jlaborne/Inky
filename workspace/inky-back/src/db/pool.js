const { Pool } = require('pg');
const dotenv = require('dotenv');

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

let connectionString;

if (process.env.NODE_ENV === 'test') {
  if (process.env.TEST_DATABASE_URL) {
    connectionString = process.env.TEST_DATABASE_URL;
  } else if (
    process.env.DB_USER_TEST &&
    process.env.DB_PASSWORD_TEST &&
    process.env.DB_HOST_TEST &&
    process.env.DB_PORT_TEST &&
    process.env.DB_NAME_TEST
  ) {
    connectionString =
      `postgres://${process.env.DB_USER_TEST}:${process.env.DB_PASSWORD_TEST}` +
      `@${process.env.DB_HOST_TEST}:${process.env.DB_PORT_TEST}/${process.env.DB_NAME_TEST}`;
  } else {
    throw new Error(
      'Config test manquante : définis TEST_DATABASE_URL (recommandé) ' +
      'ou bien DB_USER_TEST, DB_PASSWORD_TEST, DB_HOST_TEST, DB_PORT_TEST, DB_NAME_TEST.'
    );
  }
} else {
  if (process.env.DATABASE_URL) {
    connectionString = process.env.DATABASE_URL;
  } else {
    connectionString =
      `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}` +
      `@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
  }
}

const pool = new Pool({ connectionString });

try {
  const dbName = new URL(connectionString).pathname.slice(1);
  console.log('📦 Connecté à la base :', dbName);
} catch {
  console.log('📦 Connecté via :', connectionString);
}

module.exports = { pool };
