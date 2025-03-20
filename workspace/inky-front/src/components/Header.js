import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { signOutUser } from "../firebase/auth";
import { useAuth } from "../firebase/AuthProvider";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();

  const handleInkyClick = () => {
    console.log("Inky button click");
    navigate("/artists");
  };

  return (
    <Navbar bg="light" expand="lg">
      <Container className="d-flex justify-content-between align-items-center">
        <div style={{ width: "100px" }}></div>

        <Navbar.Brand
          onClick={handleInkyClick}
          className="mx-auto"
          style={{
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "1.5rem",
            textAlign: "center",
          }}
        >
          Inky
        </Navbar.Brand>

        <Nav>
          {currentUser ? (
            <>
              {userRole === "tattoo" ? (
                <Link to="/create-artist" className="nav-link">
                  Mon Profil
                </Link>
              ) : (
                <Link to="/profile" className="nav-link">
                  Mon Profil
                </Link>
              )}
              <button onClick={signOutUser}>Déconnexion</button>
            </>
          ) : (
            <Link to="/" className="nav-link">
              Créer un Compte
            </Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
