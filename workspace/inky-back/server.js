const express = require('express');
const cors = require('cors');
// Création de l'app express

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

// Création des routes API

app.get('/', (req, res) => {
  let returnObject = {
    value: "test"
  }
  res.send(returnObject);
});

app.post('/', (req, res) => {
  console.dir(req.body);
  res.send('Post réussi');
});

// Lancement du serveur

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});