import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../firebase/AuthProvider";

const PortfolioUploadForm = ({ onPortfolioUploaded }) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mainImage, setMainImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [allTags, setAllTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  const handleFileChange = (e) => {
    setMainImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!mainImage || !title) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("mainImage", mainImage);
    if (selectedTags.length > 0) {
      formData.append("tags", selectedTags.join(","));
    }

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/api/portfolios`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload portfolio");

      const newPortfolio = await response.json();
      if (onPortfolioUploaded) {
        onPortfolioUploaded(newPortfolio);
      }
      setTitle("");
      setDescription("");
      setMainImage(null);
      setSelectedTags([]);
    } catch (error) {
      console.error("Error uploading portfolio:", error);
      setErrorMessage(
        "Échec du téléchargement du portfolio. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    setLoadingTags(true);
    try {
      const resp = await fetch("http://localhost:5000/api/tags");
      if (!resp.ok) throw new Error(await resp.text());
      const data = await resp.json();
      setAllTags(data);
    } catch (e) {
      console.error("Erreur récupération tags:", e.message);
      setAllTags([]);
    } finally {
      setLoadingTags(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const toggleTag = (slug) => {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  return (
    <Form className="mb-4">
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      <Form.Group controlId="formTitle">
        <Form.Label>Titre du Portfolio</Form.Label>
        <Form.Control
          type="text"
          placeholder="Entrer le titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Form.Group>

      <div className="mb-3">
        <Form.Label>Styles (tags)</Form.Label>
        <div className="d-flex flex-wrap gap-2">
          {loadingTags ? (
            <span className="text-muted">Chargement des styles…</span>
          ) : allTags.length === 0 ? (
            <span className="text-muted">Aucun style disponible</span>
          ) : (
            allTags.map((t) => (
              <Button
                key={t.slug}
                size="sm"
                variant={
                  selectedTags.includes(t.slug) ? "primary" : "outline-primary"
                }
                onClick={(e) => {
                  e.preventDefault();
                  toggleTag(t.slug);
                }}
              >
                {t.name}
              </Button>
            ))
          )}
        </div>
      </div>

      <Form.Group controlId="formDescription">
        <Form.Label>Description du Portfolio</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Entrer une description pour le portfolio"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="formFile">
        <Form.Label>Télécharger l'Image Principale</Form.Label>
        <Form.Control type="file" onChange={handleFileChange} />
      </Form.Group>

      <Button
        onClick={handleUpload}
        disabled={!mainImage || !title || loading}
        className="mt-3"
      >
        {loading ? (
          <Spinner as="span" animation="border" size="sm" />
        ) : (
          "Télécharger le Portfolio"
        )}
      </Button>
    </Form>
  );
};

export default PortfolioUploadForm;
