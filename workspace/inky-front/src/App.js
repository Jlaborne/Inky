import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./firebase/AuthProvider";
import Home from "./components/Home";
import CreateArtistPage from "./components/CreateArtistPage";
import ArtistPage from "./components/ArtistPage";
import ArtistListPage from "./components/ArtistListPage";
import Layout from "./components/Layout";
import PortfolioPage from "./components/PortfolioPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            
            <Route
              path="/artist/:userUid"
              element={<ProtectedRoute component={ArtistPage} />}
            />
            <Route path="/create-artist" element={<CreateArtistPage />} />
            <Route path="/artists" element={<ArtistListPage />} />
            <Route
              path="/portfolio/:portfolioId"
              element={<ProtectedRoute component={PortfolioPage} />}
            />
            {/* Other routes can be added here */}
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
