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
import { FaUser, FaAt } from "react-icons/fa";

const EditProfile = () => {
  const { currentUser, authLoading } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    lastName: "",
    firstName: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setErrorMessage("You must be logged in to edit your profile.");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch(
          `http://localhost:5000/api/users/${currentUser.uid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Error fetching user data.");

        const data = await response.json();
        setUserData({
          lastName: data.last_name || "",
          firstName: data.first_name || "",
          email: data.email || "",
        });
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, authLoading]);

  const handleChange = (e) => {
    setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!currentUser) {
      setErrorMessage(
        "Vous devez vous connectez pour modifier vos informations"
      );
      return;
    }

    try {
      setSaving(true);
      const token = await currentUser.getIdToken();
      const response = await fetch(
        `http://localhost:5000/api/users/${currentUser.uid}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) throw new Error("Error updating profile.");
      setSuccessMessage("Profil mis à jour avec succès.");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(
        `http://localhost:5000/api/users/${currentUser.uid}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to delete account.");

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
        <p className="mb-0">Chargement de votre profil...</p>
      </Container>
    );
  }

  const isValid = userData.firstName.trim() && userData.lastName.trim();

  return (
    <Container className="mt-5">
      <Card className="shadow-sm border-0 form-card">
        <Card.Header className="bg-white py-4">
          <h2 className="h4 mb-1 text-primary fw-bold">
            Modifier mes informations
          </h2>
          <p className="text-muted mb-0">
            Mettez à jour votre nom et prénom. L’adresse e-mail est affichée
            mais non modifiable ici.
          </p>
        </Card.Header>

        <Card.Body className="p-4 p-md-5">
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="formFirstName">
                  <Form.Label>
                    Prénom <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaUser />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={userData.firstName}
                      onChange={handleChange}
                      placeholder="Ex. : Joshua"
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="formLastName">
                  <Form.Label>
                    Nom de famille <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaUser />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={userData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="formEmail" className="mt-3">
              <Form.Label>Adresse e-mail</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FaAt />
                </InputGroup.Text>
                <Form.Control
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  disabled
                />
              </InputGroup>
            </Form.Group>

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
                Supprimer mon compte
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

      {/* Modal de confirmation */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Supprimer le compte</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-1">
            Êtes-vous sûr de vouloir supprimer votre compte utilisateur ?
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

export default EditProfile;
