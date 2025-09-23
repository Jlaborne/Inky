import React, { useState, useEffect } from "react";
import { useAuth } from "../firebase/AuthProvider";
import { signOutUser } from "../firebase/auth";
import { Form, Button, Alert, Container, Spinner, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const EditArtistProfile = () => {
  const { currentUser, authLoading } = useAuth();
  const navigate = useNavigate();
  const [artistData, setArtistData] = useState({
    title: "",
    description: "",
    city: "",
    instagramLink: "",
    facebookLink: "",
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State for modal

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
        const response = await fetch(`http://localhost:5000/api/artists/${currentUser.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Error fetching artist data.");

        const data = await response.json();
        setArtistData({
          title: data.title,
          description: data.description,
          city: data.city,
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
    setArtistData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
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
      const token = await currentUser.getIdToken();

      const artistResponse = await fetch(`http://localhost:5000/api/artists/${currentUser.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!artistResponse.ok) throw new Error("Error fetching current artist data.");
      const existingArtist = await artistResponse.json();

      const requestBody = {
        title: artistData.title,
        phone: artistData.phone || existingArtist.phone,
        city: artistData.city,
        description: artistData.description,
        instagramLink: artistData.instagramLink,
        facebookLink: artistData.facebookLink,
        email: existingArtist.email,
      };

      const response = await fetch(`http://localhost:5000/api/artists/${currentUser.uid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("Error updating profile.");

      setSuccessMessage("Profile updated successfully.");
      navigate(`/artist/${currentUser.uid}`);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // Handle Delete Artist Profile
  const handleDeleteAccount = async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/api/artists/${currentUser.uid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error deleting profile.");

      // Log the user out and redirect to home page
      await signOutUser();
      navigate("/");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  if (authLoading || loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p>Loading your profile...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <h2>Mise à jour des Informations</h2>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formTitle">
          <Form.Label>Titre du Profile</Form.Label>
          <Form.Control type="text" name="title" value={artistData.title} onChange={handleChange} />
        </Form.Group>

        <Form.Group controlId="formDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" name="description" value={artistData.description} onChange={handleChange} />
        </Form.Group>

        <Form.Group controlId="formCity">
          <Form.Label>Ville</Form.Label>
          <Form.Control type="text" name="city" value={artistData.city} onChange={handleChange} />
        </Form.Group>

        <Form.Group controlId="formPhone">
          <Form.Label>Téléphone</Form.Label>
          <Form.Control
            type="text"
            name="phone"
            value={artistData.phone} // Ensure it's included
            onChange={handleChange}
            placeholder=""
          />
        </Form.Group>

        {/* Instagram Link Field */}
        <Form.Group controlId="formInstagram">
          <Form.Label>Lien Instagram</Form.Label>
          <Form.Control type="link" name="instagramLink" value={artistData.instagramLink} onChange={handleChange} placeholder="https://instagram.com/yourprofile" />
        </Form.Group>

        {/* Facebook Link Field */}
        <Form.Group controlId="formFacebook">
          <Form.Label>Lien Facebook</Form.Label>
          <Form.Control type="link" name="facebookLink" value={artistData.facebookLink} onChange={handleChange} placeholder="https://facebook.com/yourprofile" />
        </Form.Group>

        <Button variant="primary" type="submit">
          Mise à jour
        </Button>

        <Button variant="danger" className="ms-3" onClick={() => setShowDeleteModal(true)}>
          Supression du profil
        </Button>
      </Form>

      {/* ✅ Modal for Deletion Confirmation */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Etes-vous sûr de vouloir supprimer votre compte ?</p>
          <p>
            <strong>Cette action est irréversible.</strong>
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount}>
            Confirmer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EditArtistProfile;
