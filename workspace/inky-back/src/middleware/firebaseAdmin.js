/*const admin = require("firebase-admin");

// Get service account path from env
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

module.exports = admin;
*/

// inky-back/src/middleware/firebaseAdmin.js
const admin = require("firebase-admin");
const path = require("path");

/**
 * Deux options selon ta config :
 *
 * OPTION A — Application Default Credentials (recommandé en dev)
 *  - Mets dans ton .env :
 *      GOOGLE_APPLICATION_CREDENTIALS=/chemin/vers/serviceAccount.json
 *  - Et initialise :
 */
// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
// });

/**
 * OPTION B — Charger explicitement le JSON via le chemin
 *  - GOOGLE_APPLICATION_CREDENTIALS pointe vers le FICHIER service account
 *  - On require ce fichier pour obtenir l'objet
 */
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!serviceAccountPath) {
  throw new Error("GOOGLE_APPLICATION_CREDENTIALS is not set");
}

const serviceAccount = require(path.resolve(serviceAccountPath));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
