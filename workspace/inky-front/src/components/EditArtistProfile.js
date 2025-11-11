import React, { useState, useEffect } from "react";
import { useAuth } from "../firebase/AuthProvider";
import { signOutUser } from "../firebase/auth";
import {
  Form,
  Button,
  Alert,
  Container,
  Spinner,
  Modal,
  Card,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  FaPhone,
  FaMapMarkerAlt,
  FaInstagram,
  FaFacebook,
} from "react-icons/fa";

const EditArtistProfile = () => {
  const { currentUser, authLoading } = useAuth();
  const navigate = useNavigate();

  const [artistData, setArtistData] = useState({
    title: "",
    description: "",
    city: "",
    phone: "",
    instagramLink: "",
    facebookLink: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      setErrorMessage("You must be logged in to edit your artist profile.");
      setLoading(false);
      return;
    }

    const fetchArtistData = async () => {
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch(
          `http://localhost:5000/api/artists/${currentUser.uid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error("Error fetching artist data.");

        const data = await response.json();
        setArtistData({
          title: data.title || "",
          description: data.description || "",
          city: data.city || "",
          phone: data.phone || "",
          instagramLink: data.instagram_link || "",
          facebookLink: data.facebook_link || "",
        });
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [currentUser, authLoading]);

  const handleChange = (e) => {
    setArtistData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!currentUser) {
      setErrorMessage("You must be logged in to update your profile.");
      return;
    }

    try {
      setSaving(true);
      const token = await currentUser.getIdToken();

      // get existing for immutable fields like email if needed
      const artistResponse = await fetch(
        `http://localhost:5000/api/artists/${currentUser.uid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!artistResponse.ok)
        throw new Error("Error fetching current artist data.");
      const existingArtist = await artistResponse.json();

      const requestBody = {
        title: artistData.title,
        phone: artistData.phone || existingArtist.phone,
        city: artistData.city,
        description: artistData.description,
        instagram_link: artistData.instagramLink,
        facebook_link: artistData.facebookLink,
        email: existingArtist.email,
      };

      const response = await fetch(
        `http://localhost:5000/api/artists/${currentUser.uid}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) throw new Error("Error updating profile.");

      setSuccessMessage("Profil mis à jour avec succès.");
      navigate(`/artist/${currentUser.uid}`);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(
        `http://localhost:5000/api/artists/${currentUser.uid}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Error deleting profile.");
      await signOutUser();
      navigate("/");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p className="mb-0">Loading your profile...</p>
      </Container>
    );
  }

  const isValid =
    artistData.title.trim() &&
    artistData.city.trim() &&
    artistData.description.trim();

  return (
    <Container className="mt-5">
      <Card className="shadow-sm border-0 form-card">
        <Card.Header className="bg-white py-4">
          <h2 className="h4 mb-1 text-primary fw-bold">
            Modifier votre profil
          </h2>
          <p className="text-muted mb-0">
            Mettez à jour les informations visibles sur votre page artiste.
          </p>
        </Card.Header>

        <Card.Body className="p-4 p-md-5">
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* Section: Infos générales */}
            <div className="mb-4">
              <h3 className="h6 text-uppercase text-muted mb-3">
                Infos générales
              </h3>
              <Form.Group controlId="formTitle" className="mb-3">
                <Form.Label>
                  Titre du profil <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={artistData.title}
                  onChange={handleChange}
                  placeholder="Ex. : Inky Studio"
                  required
                />
                <Form.Text className="text-muted">
                  Le nom public de votre shop ou votre nom d’artiste.
                </Form.Text>
              </Form.Group>

              <Row className="g-3">
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
                        onChange={handleChange}
                        placeholder="Ex. : Paris"
                        required
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="formPhone">
                    <Form.Label>Téléphone</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaPhone />
                      </InputGroup.Text>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={artistData.phone}
                        onChange={handleChange}
                        placeholder="Ex. : 06 12 34 56 78"
                        inputMode="tel"
                        pattern="^[0-9 +().-]{6,}$"
                      />
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Visible sur votre page pour les prises de contact.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group controlId="formDescription" className="mt-3">
                <Form.Label>
                  Description <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={artistData.description}
                  onChange={handleChange}
                  placeholder="Parlez de votre style, vos spécialités, votre expérience…"
                  rows={5}
                  required
                />
                <div>
                  <Form.Text className="text-muted">
                    {artistData.description.length}/1000
                  </Form.Text>
                </div>
              </Form.Group>
            </div>

            {/* Section: Réseaux sociaux */}
            <div className="mb-2">
              <h3 className="h6 text-uppercase text-muted mb-3">
                Réseaux sociaux
              </h3>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group controlId="formInstagram">
                    <Form.Label>Instagram</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaInstagram />
                      </InputGroup.Text>
                      <Form.Control
                        type="url"
                        name="instagramLink"
                        value={artistData.instagramLink}
                        onChange={handleChange}
                        placeholder="https://instagram.com/votre_compte"
                        inputMode="url"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="formFacebook">
                    <Form.Label>Facebook</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaFacebook />
                      </InputGroup.Text>
                      <Form.Control
                        type="url"
                        name="facebookLink"
                        value={artistData.facebookLink}
                        onChange={handleChange}
                        placeholder="https://facebook.com/votre_page"
                        inputMode="url"
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Actions */}
            <div className="d-flex flex-wrap gap-2 mt-4">
              <Button
                variant="primary"
                type="submit"
                className="px-4"
                disabled={saving || !isValid}
              >
                {saving ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Mise à jour…
                  </>
                ) : (
                  "Mise à jour"
                )}
              </Button>

              <Button
                variant="outline-danger"
                className="ms-auto"
                onClick={() => setShowDeleteModal(true)}
              >
                Suppression du profil
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

      {/* Modal de confirmation suppression */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Supprimer le profil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-1">
            Êtes-vous sûr de vouloir supprimer votre profil artiste ?
          </p>
          <p className="mb-0">
            <strong>Cette action est irréversible.</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Confirmer la suppression
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EditArtistProfile;
