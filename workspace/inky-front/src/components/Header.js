import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { signOutUser, useAuth } from "../firebase/auth";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();

  const handleLogout = async () => {
    try {
      await signOutUser();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleInkyClick = () => {
    if (currentUser) {
      navigate("/artists");
    } else {
      navigate("/");
    }
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
              <Nav.Link onClick={handleLogout}>Déconnexion</Nav.Link>
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
