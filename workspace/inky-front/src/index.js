import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { auth } from './firebase/firebase';  // Import the Firebase auth service
import 'bootstrap/dist/css/bootstrap.min.css';

// Example usage of Firebase Auth if needed
console.log(auth);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
