import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthProvider";
import { Container, Card, Row, Col, Form, Button, Spinner, Alert } from "react-bootstrap";

const PortfolioPage = () => {
  const { portfolioId } = useParams();
  const { currentUser } = useAuth();
  const [portfolioData, setPortfolioData] = useState(null);
  const [images, setImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortfolioDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/portfolios/${portfolioId}`);
        if (!response.ok) throw new Error("Failed to fetch portfolio details");

        const data = await response.json();
        setPortfolioData(data);
        setImages(data.images);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    fetchPortfolioDetails();
  }, [portfolioId]);

  const isOwner = currentUser && portfolioData && currentUser.uid === portfolioData.artist_uid;

  const handleFileChange = (e) => setImageFile(e.target.files[0]);

  const handleUploadImage = async () => {
    if (!imageFile) return;

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/api/portfolios/${portfolioId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload image");

      const newImage = await response.json();
      setImages((prev) => [...prev, newImage]);
      setImageFile(null);
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrorMessage("Failed to upload image.");
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Supprimer cette image ?")) return;

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/api/portfolio-images/${imageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Erreur lors de la suppression de l'image");

      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error("Erreur suppression image:", error.message);
      setErrorMessage("Impossible de supprimer l'image.");
    }
  };

  const handleDeletePortfolio = async () => {
    if (!window.confirm("Supprimer ce portfolio ? Cette action est irréversible.")) return;

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/api/portfolios/${portfolioId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Échec de la suppression du portfolio");

      // Redirection après suppression
      navigate(`/artist/${currentUser.uid}`);
    } catch (error) {
      console.error("Erreur suppression portfolio:", error.message);
      setErrorMessage("Impossible de supprimer le portfolio.");
    }
  };

  if (!portfolioData) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p>Loading portfolio details...</p>
      </Container>
    );
  }

  console.log("🔍 currentUser UID:", currentUser?.uid);
  console.log("🖼 portfolio owner UID:", portfolioData?.artist_uid);
  console.log("🧾 isOwner:", isOwner);

  return (
    <Container className="mt-5">
      {errorMessage && (
        <Alert variant="danger" className="text-center">
          {errorMessage}
        </Alert>
      )}
      <h2>{portfolioData.title}</h2>
      <p>{portfolioData.description}</p>

      {/* Image Upload Form - Only for Owner */}
      {isOwner && (
        <Form.Group controlId="formFile" className="mb-3">
          {/* Ligne 1 : Champ "Parcourir..." */}
          <Form.Control type="file" onChange={handleFileChange} className="mb-2" />

          {/* Ligne 2 : Boutons sur la même ligne */}
          <div className="d-flex justify-content-end gap-2">
            <Button variant="primary" onClick={handleUploadImage} disabled={!imageFile}>
              Ajouter une image
            </Button>
            <Button variant="outline-danger" onClick={handleDeletePortfolio}>
              Supprimer ce portfolio
            </Button>
          </div>
        </Form.Group>
      )}

      {/* Display Images */}
      <Row className="mt-4">
        {images.map((img) => (
          <Col key={img.id} md={4} className="mb-4">
            <Card>
              <Card.Img variant="top" src={img.image_url} />

              {isOwner && (
                <Card.Body className="text-center">
                  <Button variant="danger" size="sm" onClick={() => handleDeleteImage(img.id)}>
                    Supprimer
                  </Button>
                </Card.Body>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default PortfolioPage;
