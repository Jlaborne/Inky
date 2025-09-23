module.exports = {
  env: {
    node: true, // Indique que le code tourne dans Node.js
    es2021: true, // Active les fonctionnalités ECMAScript modernes
  },
  extends: ["eslint:recommended"], // Utilise les règles de base d'ESLint
  parserOptions: {
    ecmaVersion: 12, // Utilise ES2021 (peut être mis à jour selon besoin)
    sourceType: "module", // Ou "script" si tu utilises CommonJS
  },
  rules: {
    "no-console": "off", // Désactive l'avertissement sur `console.log`
    indent: ["error", 2], // Indentation avec 2 espaces
    quotes: ["error", "double"], // Utilisation de guillemets doubles
    semi: ["error", "always"], // Points-virgules obligatoires
  },
};
