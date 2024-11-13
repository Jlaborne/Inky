import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../firebase/auth";
import { Container, Card, Row, Col, Alert, Spinner } from "react-bootstrap";
import { FaInstagram, FaFacebook, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import PortfolioUploadForm from "./PortfolioUploadForm";

const ArtistPage = () => {
  const { userUid } = useParams();
  const { currentUser, authLoading } = useAuth();
  const [artistData, setArtistData] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const isOwner = currentUser && currentUser.uid === userUid;

  useEffect(() => {
    if (authLoading) return; // Attendre que l'authentification soit résolue

    const fetchArtistData = async () => {
      try {
        console.log("Fetching artist data for UID:", userUid);
        const token = await currentUser.getIdToken();
        const response = await fetch(`http://localhost:5000/api/artists/${userUid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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
        const response = await fetch(`http://localhost:5000/api/artists/${userUid}/portfolios`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
    <Container className="mt-5">
      <Card className="p-4 shadow-lg rounded">
        <Card.Body>
          <Card.Title as="h2" className="text-center mb-4 text-uppercase">
            {artistData.title}
          </Card.Title>
          <Row>
            <Col md={6} className="mb-3">
              <Card.Text>
                <strong>Description :</strong> {artistData.description || "Aucune description disponible"}
              </Card.Text>
              <Card.Text>
                <FaMapMarkerAlt className="me-2 text-secondary" />
                <strong>Ville :</strong> {artistData.city || "Ville non renseignée"}
              </Card.Text>
            </Col>
            <Col md={6} className="mb-3">
              <Card.Text>
                <FaPhone className="me-2 text-secondary" />
                <strong>Téléphone :</strong> {artistData.phone || "Numéro non renseigné"}
              </Card.Text>
              <Card.Text>
                <FaInstagram className="me-2 text-secondary" />
                <strong>Instagram :</strong>{" "}
                {artistData.instagram_link ? (
                  <a href={artistData.instagram_link} target="_blank" rel="noopener noreferrer">
                    {artistData.instagram_link}
                  </a>
                ) : (
                  "N/A"
                )}
              </Card.Text>
              <Card.Text>
                <FaFacebook className="me-2 text-secondary" />
                <strong>Facebook :</strong>{" "}
                {artistData.facebook_link ? (
                  <a href={artistData.facebook_link} target="_blank" rel="noopener noreferrer">
                    {artistData.facebook_link}
                  </a>
                ) : (
                  "N/A"
                )}
              </Card.Text>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Section Portfolio */}
      <Container className="mt-4">
        <h3 className="text-center mb-3">Portfolio</h3>

        {isOwner && (
          <PortfolioUploadForm
            onPortfolioUploaded={(newPortfolio) => {
              setPortfolios((prev) => [...prev, newPortfolio]);
            }}
          />
        )}

        <Row className="mt-4">
          {portfolios.length > 0 ? (
            portfolios.map((portfolio) => (
              <Col key={portfolio.id} md={4} className="mb-3">
                <Link to={`/portfolio/${portfolio.id}`} className="text-decoration-none">
                  <Card className="portfolio-card">
                    <Card.Img
                      variant="top"
                      src={portfolio.main_image_url}
                      style={{ borderRadius: "8px" }}
                    />
                  </Card>
                </Link>
              </Col>
            ))
          ) : (
            <p className="text-center">Aucun portfolio téléchargé pour le moment.</p>
          )}
        </Row>
      </Container>
    </Container>
  );
};

export default ArtistPage;