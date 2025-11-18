import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Container,
  Alert,
  Card,
  Row,
  Col,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import {
  FaPhone,
  FaMapMarkerAlt,
  FaInstagram,
  FaFacebook,
} from "react-icons/fa";

const CreateArtistPage = () => {
  const [artistData, setArtistData] = useState({
    title: "",
    phone: "",
    description: "",
    city: "",
    instagram_link: "",
    facebook_link: "",
  });
  const [userUid, setUserUid] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserUid(user.uid);
        try {
          const token = await auth.currentUser.getIdToken();
          const response = await fetch(
            `http://localhost:5000/api/artists/${user.uid}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (response.ok) {
            navigate(`/artist/${user.uid}`);
          } else if (response.status !== 404) {
            console.error(
              "Error checking artist profile:",
              response.statusText
            );
          }
        } catch (e) {
          console.error("Error checking artist profile:", e);
        }
      } else {
        console.error(
          "Auth state changed but no user found. Please log in again."
        );
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setArtistData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!userUid) {
      setErrorMessage("User UID not available. Please log in again.");
      return;
    }

    try {
      setSubmitting(true);
      const token = await auth.currentUser.getIdToken();
      const response = await fetch("http://localhost:5000/api/artists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...artistData, userUid }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (data.errors) {
          setErrorMessage(data.errors.map((err) => err.msg).join(", "));
        } else {
          setErrorMessage(data.message || "Failed to create profile.");
        }
        return;
      }

      setSuccessMessage("Tattoo artist profile created successfully!");
      navigate(`/artist/${userUid}`);
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      console.error("Error creating artist profile:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // optional: basic derived validation
  const isValid =
    artistData.title.trim() &&
    artistData.phone.trim() &&
    artistData.description.trim() &&
    artistData.city.trim();

  return (
    <Container className="mt-5">
      <Card className="shadow-sm form-card border-0">
        <Card.Header className="bg-white py-4">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="h4 mb-1 text-primary fw-bold">
                Créer votre page artiste
              </h2>
              <p className="text-muted mb-0">
                Renseignez les informations de base pour présenter votre shop.
              </p>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-4 p-md-5">
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* Title */}
            <Form.Group controlId="formTitle" className="mb-3">
              <Form.Label>
                Titre <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={artistData.title}
                onChange={handleInputChange}
                placeholder="Ex. : Inky Studio"
                required
                autoFocus
              />
              <Form.Text className="text-muted">
                Le nom public de votre shop ou votre nom d’artiste.
              </Form.Text>
            </Form.Group>

            {/* 2-column: Phone / City */}
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="formPhone">
                  <Form.Label>
                    Numéro de téléphone <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaPhone />
                    </InputGroup.Text>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={artistData.phone}
                      onChange={handleInputChange}
                      placeholder="Ex. : 06 12 34 56 78"
                      required
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Utilisé pour les prises de contact.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="formCity">
                  <Form.Label>
                    Ville <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaMapMarkerAlt />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="city"
                      value={artistData.city}
                      onChange={handleInputChange}
                      placeholder="Ex. : Paris"
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            {/* Description */}
            <Form.Group controlId="formDescription" className="mt-3">
              <Form.Label>
                Description <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={artistData.description}
                onChange={handleInputChange}
                placeholder="Parlez de votre style, de vos spécialités, de votre expérience…"
                rows={5}
                required
              />
              <div className="d-flex justify-content-between">
                <Form.Text className="text-muted">
                  Décrivez-vous en quelques lignes.
                </Form.Text>
                <Form.Text className="text-muted">
                  {artistData.description.length}/1000
                </Form.Text>
              </div>
            </Form.Group>

            {/* Socials */}
            <Row className="g-3 mt-1">
              <Col md={6}>
                <Form.Group controlId="formInstagramLink">
                  <Form.Label>Instagram</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaInstagram />
                    </InputGroup.Text>
                    <Form.Control
                      type="url"
                      name="instagram_link"
                      value={artistData.instagram_link}
                      onChange={handleInputChange}
                      placeholder="https://instagram.com/votre_compte"
                      inputMode="url"
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Lien complet recommandé (https://…).
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="formFacebookLink">
                  <Form.Label>Facebook</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaFacebook />
                    </InputGroup.Text>
                    <Form.Control
                      type="url"
                      name="facebook_link"
                      value={artistData.facebook_link}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com/votre_page"
                      inputMode="url"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            {/* Submit */}
            <div className="d-grid mt-4">
              <Button
                variant="primary"
                type="submit"
                className="py-2"
                disabled={submitting || !isValid}
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Création en cours…
                  </>
                ) : (
                  "Créer le profil"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>

        <Card.Footer className="bg-white text-muted small text-center">
          <span>Les champs marqués d’un </span>
          <span className="text-danger">*</span>
          <span> sont obligatoires.</span>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default CreateArtistPage;
