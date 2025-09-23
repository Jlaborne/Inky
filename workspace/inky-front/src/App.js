import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./firebase/AuthProvider";
import Home from "./components/Home";
import CreateArtistPage from "./components/CreateArtistPage";
import ArtistPage from "./components/ArtistPage";
import ArtistListPage from "./components/ArtistListPage";
import Layout from "./components/Layout";
import PortfolioPage from "./components/PortfolioPage";
import ProtectedRoute from "./components/ProtectedRoute";
import EditProfile from "./components/EditProfile";
import EditArtistProfile from "./components/EditArtistProfile";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/artist/:userUid" element={<ProtectedRoute component={ArtistPage} />} />
            <Route path="/create-artist" element={<CreateArtistPage />} />
            <Route path="/artists" element={<ArtistListPage />} />
            <Route path="/portfolio/:portfolioId" element={<ProtectedRoute component={PortfolioPage} />} />
            <Route path="/profile" element={<EditProfile />} />
            <Route path="/edit-artist-profile" element={<EditArtistProfile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
