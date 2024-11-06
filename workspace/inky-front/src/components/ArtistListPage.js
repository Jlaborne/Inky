import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Form, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ArtistListPage = () => {
  const [artists, setArtists] = useState([]);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchArtists = async (cityFilter) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/artists?city=${cityFilter || ''}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      setArtists(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des artistes :", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Appliquer un délai pour éviter les appels API trop fréquents
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchArtists(city);
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [city]);

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Recherche de Tatoueurs par Ville</h2>

      <Form.Group controlId="cityFilter" className="mb-4 text-center">
        <Form.Control
          type="text"
          placeholder="Entrez une ville"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}
        />
      </Form.Group>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Chargement des artistes...</p>
        </div>
      ) : artists.length > 0 ? (
        <Row>
          {artists.map((artist) => (
            <Col md={6} lg={4} className="mb-4" key={artist.uid}>
              <Card style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <Card.Body>
                  <Card.Title>{artist.title}</Card.Title>
                  <Card.Text>
                    <strong>Ville:</strong> {artist.city} <br />
                    <strong>Description:</strong> {artist.description}
                  </Card.Text>
                  <Link to={`/artist/${artist.user_uid}`} className="btn btn-primary">
                    Voir le profil
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p className="text-center text-muted">Aucun artiste trouvé pour cette ville.</p>
      )}
    </Container>
  );
};

export default ArtistListPage;
