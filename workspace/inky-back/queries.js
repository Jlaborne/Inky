const User = require('./model/user.js');
const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "inky-db",
  password: "nitenboy53",
  port: 5432,
});
const getUsers = async () => {
  try {
    let resultQuery = await pool.query("SELECT * FROM users ORDER BY id ASC");
    let result = [];
    resultQuery.rows.forEach((element) => result.push(new User(element.id, element.name, element.email)));
    return result;
  }

  catch (error) {
    console.log(`getUsers erreur : ${error}`);
    throw error;
  }
};

const getUserById = async (id) => {
  try {
    let resultQuery = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    let result = resultQuery.rows[0];
    return new User(result.id, result.name, result.email);
  }
  catch (error) {
    console.log(`getUserById erreur : ${error}`);
    throw error;
  }
};

const createUser = async (user) => {
  try {
    let resultQuery = await pool.query("INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id",
      [user.name, user.email]
    );
    user.id = resultQuery.rows[0].id;
    return user;
  }
  catch (error) {
    console.log(`createUser erreur : ${error}`);
    throw error;
  }
};
/*const createUser = (request, response) => {
  const { name, email } = request.body;

  pool.query(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id",
    [name, email],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`User added with ID: ${results.rows[0].id}`);
    }
  );
};*/

const updateUser = async (user) => {
  try {
    let resultQuery = await pool.query("UPDATE users SET name = $1, email = $2 WHERE id = $3",
      [user.name, user.email, user.id]
    );
    return user;
  }
  catch (error) {
    console.log(`updateUser erreur : ${error}`);
    throw error;
  }
};
/*const updateUser = (request, response) => {
  const id = parseInt(request.params.id);
  const { name, email } = request.body;

  pool.query(
    "UPDATE users SET name = $1, email = $2 WHERE id = $3",
    [name, email, id],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send(`User modified with ID: ${id}`);
    }
  );
};*/


const deleteUser = async(id) => {
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
  }
  catch (error) {
    console.log(`updateUser erreur : ${error}`);
    throw error;
  }
};
/*const deleteUser = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query("DELETE FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send(`User deleted with ID: ${id}`);
  });
};*/

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
