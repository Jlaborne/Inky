import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Register from "./components/Register"; // Import the Register component
import TattooArtistPage from "./components/TattooArtistPage"; // Import the TattooArtistPage component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />{" "}
        <Route
          path="/create-tattoo-artist-page"
          element={<TattooArtistPage />}
        />
        {/* Add the register route */}
      </Routes>
    </Router>
  );
}

export default App;
