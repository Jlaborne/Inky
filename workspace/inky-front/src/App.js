import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Register from "./components/Register";
import CreateArtistPage from "./components/CreateArtistPage";
import ArtistPage from "./components/ArtistPage"; // Fixed import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/artist/:userUid" element={<ArtistPage />} />
        <Route path="/create-artist" element={<CreateArtistPage />} />
        {/* Other routes can be added here */}
      </Routes>
    </Router>
  );
}

export default App;
