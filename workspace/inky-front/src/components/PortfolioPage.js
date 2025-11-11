import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { FaImages, FaUpload, FaTrash } from "react-icons/fa";

const PortfolioPage = () => {
  const { portfolioId } = useParams();
  const { currentUser } = useAuth();
  const [portfolioData, setPortfolioData] = useState(null);
  const [images, setImages] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingPortfolio, setDeletingPortfolio] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortfolioDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/portfolios/${portfolioId}`
        );
        if (!response.ok) throw new Error("Failed to fetch portfolio details");

        const data = await response.json();
        setPortfolioData(data);
        setImages(data.images || []);
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
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", imageFile);

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
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Supprimer cette image ?")) return;

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(
        `http://localhost:5000/api/portfolio-images/${imageId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok)
        throw new Error("Erreur lors de la suppression de l'image");

      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error("Erreur suppression image:", error.message);
      setErrorMessage("Impossible de supprimer l'image.");
    }
  };

  const handleDeletePortfolio = async () => {
    if (
      !window.confirm("Supprimer ce portfolio ? Cette action est irréversible.")
    )
      return;

    try {
      setDeletingPortfolio(true);
      const token = await currentUser.getIdToken();
      const response = await fetch(
        `http://localhost:5000/api/portfolios/${portfolioId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Échec de la suppression du portfolio");
      navigate(`/artist/${currentUser.uid}`);
    } catch (error) {
      console.error("Erreur suppression portfolio:", error.message);
      setErrorMessage("Impossible de supprimer le portfolio.");
    } finally {
      setDeletingPortfolio(false);
    }
  };

  if (!portfolioData) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p className="mb-0">Loading portfolio details...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Card className="shadow-sm border-0 portfolio-page-card">
        <Card.Header className="bg-white py-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h4 mb-1 text-primary fw-bold">
                {portfolioData.title}
              </h2>
              <p className="text-muted mb-0">
                {images.length > 0
                  ? `${images.length} image${
                      images.length > 1 ? "s" : ""
                    } dans ce portfolio`
                  : "Aucune image pour le moment"}
              </p>
            </div>
            {isOwner && (
              <div className="text-end">
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleDeletePortfolio}
                  disabled={deletingPortfolio}
                >
                  {deletingPortfolio ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Suppression…
                    </>
                  ) : (
                    "Supprimer le portfolio"
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card.Header>

        <Card.Body className="p-4 p-md-5">
          {portfolioData.description && (
            <Card className="border-0 bg-light mb-4">
              <Card.Body className="py-3">
                <p className="mb-0 text-muted">{portfolioData.description}</p>
              </Card.Body>
            </Card>
          )}

          {errorMessage && (
            <Alert variant="danger" className="text-center">
              {errorMessage}
            </Alert>
          )}

          {/* Upload card (owner only) */}
          {isOwner && (
            <Card className="mb-4 bg-light portfolio-upload-card">
              <Card.Body className="p-3 p-md-4">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <FaUpload />
                    <div>
                      <div className="fw-semibold">Ajouter des images</div>
                      <small className="text-muted">
                        Formats acceptés (JPEG/PNG)
                      </small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Control
                      type="file"
                      onChange={handleFileChange}
                      className="w-auto"
                    />
                    <Button
                      variant="primary"
                      onClick={handleUploadImage}
                      disabled={!imageFile || uploading}
                    >
                      {uploading ? (
                        <>
                          <Spinner
                            size="sm"
                            animation="border"
                            className="me-2"
                          />
                          Upload…
                        </>
                      ) : (
                        "Ajouter une image"
                      )}
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Images grid */}
          {images.length > 0 ? (
            <Row className="g-4">
              {images.map((img) => (
                <Col key={img.id} xl={3} lg={4} md={6} sm={12}>
                  <Card className="h-100 border-0 shadow-sm image-card overflow-hidden position-relative">
                    <div className="image-container">
                      <Card.Img
                        variant="top"
                        src={img.image_url}
                        className="w-100 h-100 image"
                        alt="Portfolio"
                      />
                    </div>

                    {isOwner && (
                      <div className="position-absolute top-0 end-0 m-2">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteImage(img.id)}
                          className="d-flex align-items-center gap-1"
                          title="Supprimer l'image"
                        >
                          <FaTrash />
                          <span className="d-none d-md-inline">Supprimer</span>
                        </Button>
                      </div>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Card className="text-center py-5 border-0 bg-light">
              <Card.Body>
                <div className="text-muted mb-3">
                  <FaImages size={48} className="opacity-50" />
                </div>
                <h5 className="text-muted mb-2">Aucune image disponible</h5>
                <p className="text-muted mb-0">
                  {isOwner
                    ? "Ajoutez votre première image pour présenter vos créations."
                    : "L’artiste n’a pas encore publié d’images."}
                </p>
              </Card.Body>
            </Card>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PortfolioPage;
