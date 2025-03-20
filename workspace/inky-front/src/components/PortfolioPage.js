import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../firebase/AuthProvider";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";

const PortfolioPage = () => {
  const { portfolioId } = useParams();
  const { currentUser } = useAuth();
  const [portfolioData, setPortfolioData] = useState(null);
  const [images, setImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchPortfolioDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/portfolios/${portfolioId}`
        );
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

  const isOwner =
    currentUser &&
    portfolioData &&
    currentUser.uid === portfolioData.artist_uid;

  const handleFileChange = (e) => setImageFile(e.target.files[0]);

  const handleUploadImage = async () => {
    if (!imageFile) return;

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(
        `http://localhost:5000/api/portfolios/${portfolioId}/images`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to upload image");

      const newImage = await response.json();
      setImages((prev) => [...prev, newImage]);
      setImageFile(null);
    } catch (error) {
      console.error("Error uploading image:", error);
      setErrorMessage("Failed to upload image.");
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
          <Form.Control type="file" onChange={handleFileChange} />
          <Button onClick={handleUploadImage} disabled={!imageFile}>
            Ajouter une image
          </Button>
        </Form.Group>
      )}

      {/* Display Images */}
      <Row className="mt-4">
        {images.map((img) => (
          <Col key={img.id} md={4} className="mb-4">
            <Card>
              <Card.Img variant="top" src={img.image_url} />
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default PortfolioPage;
