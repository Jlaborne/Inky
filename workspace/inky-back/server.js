const express = require("express");
const cors = require("cors");
//const bodyParser = require('body-parser')
const app = express();
const db = require("./queries");
const port = 5000;

app.use(cors());
// Parser JSON
app.use(express.json());
// Parser URL-encoded
app.use(express.urlencoded({ extended: true }));

// Création des routes API

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

app.get("/users", db.getUsers);
app.get("/users/:id", db.getUserById);
app.post("/users", db.createUser);
app.put("/users/:id", db.updateUser);
app.delete("/users/:id", db.deleteUser);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
