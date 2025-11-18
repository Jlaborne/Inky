import React, { useState, useEffect } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  Form,
  Spinner,
  Button,
} from "react-bootstrap";
import { Link } from "react-router-dom";

const ArtistListPage = () => {
  const [artists, setArtists] = useState([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);

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

  const fetchArtists = async (cityFilter, tagSlugs = []) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cityFilter) params.set("city", cityFilter);
      if (tagSlugs.length) params.set("tags", tagSlugs.join(","));
      const resp = await fetch(`http://localhost:5000/api/artists?${params}`);
      if (!resp.ok) throw new Error(await resp.text());
      setArtists(await resp.json());
    } catch (e) {
      console.error("Erreur récup artistes:", e.message);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // Rechercher quand ville ou tags changent
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchArtists(city, selectedTags);
    }, 200);
    return () => clearTimeout(delay);
  }, [city, selectedTags]);

  const toggleTag = (slug) => {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const resetTags = () => setSelectedTags([]);

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Recherche de Tatoueurs</h2>

      {/* Filtre ville */}
      <Form.Group controlId="cityFilter" className="mb-3 text-center">
        <Form.Control
          type="text"
          placeholder="Entrez une ville (ex: Lyon)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ width: "100%", maxWidth: "300px", margin: "0 auto" }}
        />
      </Form.Group>

      {/* Filtre tags */}
      <div className="mb-4 d-flex flex-wrap gap-2 justify-content-center">
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
              onClick={() => toggleTag(t.slug)}
            >
              {t.name}
            </Button>
          ))
        )}
        {selectedTags.length > 0 && (
          <Button
            size="sm"
            variant="link"
            className="text-danger"
            onClick={resetTags}
          >
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Liste artistes */}
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Chargement des artistes…</p>
        </div>
      ) : artists.length > 0 ? (
        <Row>
          {artists.map((artist) => (
            <Col md={6} lg={4} className="mb-4" key={artist.uid}>
              <Card
                className="h-100 shadow-sm d-flex flex-column w-100"
                style={{ minHeight: 300 }}
              >
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="text-center">
                    {artist.title}
                  </Card.Title>
                  <Card.Text className="flex-grow-1">
                    <div
                      style={{
                        marginBottom: 8,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      <strong>Ville:</strong> {artist.city}
                    </div>
                    <div
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      <strong>Description:</strong> {artist.description}
                    </div>
                  </Card.Text>
                  <Link
                    to={`/artist/${artist.uid}`}
                    className="btn btn-primary mt-auto"
                  >
                    Voir le profil
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p className="text-center text-muted">Aucun artiste trouvé.</p>
      )}
    </Container>
  );
};

export default ArtistListPage;
