import { Navbar, Nav, Container } from "react-bootstrap";
import { signOutUser } from "../firebase/auth";
import { useAuth } from "../firebase/AuthProvider";
import { useLocation, Link, useNavigate } from "react-router-dom";
import BackButton from "./BackButton";

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();
  const location = useLocation();

  const showBackButton =
    location.pathname.startsWith("/artist/") ||
    location.pathname.startsWith("/portfolio/") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/edit-artist-profile");

  const handleInkyClick = () => navigate("/artists");

  return (
    <Navbar bg="light" expand="lg" className="py-2">
      <Container
        fluid
        className="px-3"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
        }}
      >
        <div className="justify-self-start">
          {showBackButton && <BackButton />}
        </div>

        <Navbar.Brand
          onClick={handleInkyClick}
          className="fw-bold fs-4"
          style={{ cursor: "pointer", justifySelf: "center" }}
        >
          Inky
        </Navbar.Brand>

        <Nav className="align-items-center" style={{ justifySelf: "end" }}>
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
              <button onClick={signOutUser} className="nav-link btn btn-link">
                Déconnexion
              </button>
            </>
          ) : (
            <Link to="/" className="nav-link">
              Créer un compte / Se connecter
            </Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
