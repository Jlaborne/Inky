import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthProvider";
import {
  Container,
  Card,
  Row,
  Col,
  Alert,
  Spinner,
  Button,
  Badge,
} from "react-bootstrap";
import {
  FaInstagram,
  FaFacebook,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
} from "react-icons/fa";
import PortfolioUploadForm from "./PortfolioUploadForm";

const ArtistPage = () => {
  const navigate = useNavigate();
  const { userUid } = useParams();
  const { currentUser, authLoading } = useAuth();
  const [artistData, setArtistData] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const fetchArtistData = async () => {
      try {
        console.log("Fetching artist data for UID:", userUid);
        const token = await currentUser.getIdToken();
        const response = await fetch(
          `http://localhost:5000/api/artists/${userUid}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch artist data");

        const data = await response.json();
        console.log("Artist data fetched:", data);
        setArtistData(data);

        fetchPortfolios(token);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchPortfolios = async (token) => {
      try {
        console.log("Fetching portfolios for artist UID:", userUid);
        const response = await fetch(
          `http://localhost:5000/api/artists/${userUid}/portfolios`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch portfolios");

        const portfoliosData = await response.json();
        console.log("Portfolios data fetched:", portfoliosData);
        setPortfolios(portfoliosData);
      } catch (error) {
        console.error("Error fetching portfolios:", error);
      }
    };

    if (currentUser) {
      fetchArtistData();
    } else {
      console.log("User is not authenticated");
    }
  }, [userUid, currentUser, authLoading]);

  // Déterminer si l'utilisateur connecté est le propriétaire du profil
  const isOwner = currentUser?.uid === artistData?.uid;

  console.log("currentUser:", currentUser?.uid);
  console.log("artistData.user_id:", artistData?.user_id);
  console.log("isOwner:", isOwner);

  const handleEditClick = () => {
    navigate(`/edit-artist-profile`);
  };

  if (authLoading || loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" />
        <p>Loading artist profile...</p>
      </Container>
    );
  }

  if (errorMessage) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{errorMessage}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4" style={{ maxWidth: "1200px" }}>
      {/* En-tête avec titre et bouton d'édition */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-4 mb-0 text-primary fw-bold">
          {artistData.title}
        </h1>
        {isOwner && (
          <Button
            variant="outline-primary"
            onClick={handleEditClick}
            className="d-flex align-items-center gap-2"
          >
            <FaEdit /> Modifier le profil
          </Button>
        )}
      </div>

      {/* Section informations de l'artiste */}
      <Card className="mb-5 border-0 shadow-sm">
        <Card.Body className="p-4">
          <Row className="g-0">
            {/* Description */}
            <Col lg={12}>
              <div className="mb-4">
                <h4 className="text-secondary mb-3">À propos</h4>
                <p className="lead text-muted" style={{ lineHeight: "1.6" }}>
                  {artistData.description || "Aucune description disponible"}
                </p>
              </div>
            </Col>

            {/* Informations de contact */}
            <Col md={6} lg={6}>
              <h5 className="text-secondary mb-3 text-center">
                Informations de contact
              </h5>
              <div className="d-flex flex-column gap-3 align-items-center">
                <div className="d-flex align-items-center justify-content-center text-center">
                  <div
                    className="me-3 text-primary d-flex justify-content-center"
                    style={{ minWidth: "24px" }}
                  >
                    <FaMapMarkerAlt size={20} />
                  </div>
                  <div className="flex-grow-1 text-center">
                    <small className="text-muted d-block">Localisation</small>
                    <span className="fw-semibold">
                      {artistData.city || "Ville non renseignée"}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-center text-center">
                  <div
                    className="me-3 text-primary d-flex justify-content-center"
                    style={{ minWidth: "24px" }}
                  >
                    <FaPhone size={18} />
                  </div>
                  <div className="flex-grow-1 text-center">
                    <small className="text-muted d-block">Téléphone</small>
                    <span className="fw-semibold">
                      {artistData.phone || "Numéro non renseigné"}
                    </span>
                  </div>
                </div>
              </div>
            </Col>

            {/* Réseaux sociaux - ALIGNÉS À DROITE */}
            <Col md={6} lg={6}>
              <h5 className="text-secondary mb-3 text-center">
                Réseaux sociaux
              </h5>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center justify-content-center">
                  <div className="text-end me-3">
                    <small className="text-muted d-block">Instagram</small>
                    {artistData.instagram_link ? (
                      <a
                        href={artistData.instagram_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none fw-semibold"
                      >
                        Voir la page
                      </a>
                    ) : (
                      <span className="text-muted">Non renseigné</span>
                    )}
                  </div>
                  <div
                    className="text-primary d-flex justify-content-center"
                    style={{ minWidth: "24px" }}
                  >
                    <FaInstagram size={20} />
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-center">
                  <div className="text-end me-3">
                    <small className="text-muted d-block">Facebook</small>
                    {artistData.facebook_link ? (
                      <a
                        href={artistData.facebook_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none fw-semibold"
                      >
                        Voir la page
                      </a>
                    ) : (
                      <span className="text-muted">Non renseigné</span>
                    )}
                  </div>
                  <div
                    className="text-primary d-flex justify-content-center"
                    style={{ minWidth: "24px" }}
                  >
                    <FaFacebook size={20} />
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Section Portfolio */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">Portfolio</h2>
            <p className="text-muted mb-0">
              {portfolios.length > 0
                ? `${portfolios.length} projet${
                    portfolios.length > 1 ? "s" : ""
                  } disponible${portfolios.length > 1 ? "s" : ""}`
                : "Aucun projet pour le moment"}
            </p>
          </div>
        </div>

        {isOwner && (
          <Card
            className="mb-4 border-dashed border-2"
            style={{ borderStyle: "dashed !important" }}
          >
            <Card.Body className="p-3">
              <PortfolioUploadForm
                onPortfolioUploaded={(newPortfolio) => {
                  setPortfolios((prev) => [...prev, newPortfolio]);
                }}
              />
            </Card.Body>
          </Card>
        )}

        {/* Grille de portfolios avec tailles uniformes */}
        {portfolios.length > 0 ? (
          <Row className="g-4">
            {portfolios.map((portfolio) => (
              <Col key={portfolio.id} xl={4} lg={4} md={6} sm={12}>
                <Link
                  to={`/portfolio/${portfolio.id}`}
                  className="text-decoration-none"
                >
                  <Card className="h-100 border-0 shadow-sm portfolio-card overflow-hidden">
                    <div
                      className="portfolio-image-container"
                      style={{
                        height: "280px",
                        overflow: "hidden",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <Card.Img
                        variant="top"
                        src={portfolio.main_image}
                        className="w-100 h-100"
                        style={{
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.transform = "scale(1.05)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.transform = "scale(1)")
                        }
                      />
                    </div>
                    <Card.Body className="p-3">
                      <Card.Title className="h6 mb-0 text-truncate">
                        {portfolio.title}
                      </Card.Title>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        ) : (
          <Card className="text-center py-5 border-0 bg-light">
            <Card.Body>
              <div className="text-muted mb-3">
                <FaInstagram size={48} className="opacity-50" />
              </div>
              <h5 className="text-muted mb-2">Aucun portfolio disponible</h5>
              <p className="text-muted mb-0">
                {isOwner
                  ? "Ajoutez votre premier projet pour commencer à présenter votre travail !"
                  : "L'artiste n'a pas encore publié de projets."}
              </p>
            </Card.Body>
          </Card>
        )}
      </div>

      <style jsx>{`
        .border-dashed {
          border-style: dashed !important;
        }
        .portfolio-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .portfolio-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </Container>
  );
};

export default ArtistPage;
