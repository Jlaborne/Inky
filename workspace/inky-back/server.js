const express = require("express");
const cors = require("cors");
const User = require('./model/user.js');
const db = require("./queries");

const app = express();
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

// 
app.get("/users", async (request, response) => {
  try {
    let result = await db.getUsers();
    response.status(200).json(result);
  }
  catch (error) {
    response.status(500).send(" Erreur !");
  }
});

app.get("/users/:id", async (request, response) => {
  try {
    const id = parseInt(request.params.id);
    let result = await db.getUserById(id);
    response.status(200).json(result);
  }
  catch (error) {
    response.status(404).send(" Erreur !");
  }
});

//app.post("/users", db.createUser);
app.post("/users", async (request, response) => {
  try {
    let user = new User(-1, request.body.name, request.body.email);
    let result = await db.createUser(user);
    response.status(201).json(result);
  }
  catch (error) {
    response.status(500).send(" Erreur !");
  }
});

//app.put("/users/:id", db.updateUser);
app.put("/users/:id", async (request, response) => {
  try {
    let user = new User(request.params.id, request.body.name, request.body.email);
    let result = await db.updateUser(user);
    response.status(200).json(result);
  }
  catch (error) {
    response.status(500).send(" Erreur !");
  }
});

//app.delete("/users/:id", db.deleteUser);
app.delete("/users/:id", async (request, response) => {
  try {
    await db.deleteUser(request.params.id);
    response.status(200).send("Supression éffectuée");
  }
  catch (error) {
    response.status(500).send(" Erreur !");
  }
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
