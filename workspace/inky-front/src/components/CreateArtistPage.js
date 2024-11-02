import React, { useState, useEffect } from "react";
import { Button, Form, Container, Alert } from "react-bootstrap";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const CreateArtistPage = () => {
  const [artistData, setArtistData] = useState({
    title: "",
    phone: "",
    description: "",
    city: "",
    instagramLink: "",
    facebookLink: "",
  });
  const [userUid, setUserUid] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserUid(user.uid);
      } else {
        console.error(
          "Auth state changed but no user found. Please log in again."
        );
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setArtistData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userUid) {
      setErrorMessage("User UID not available. Please log in again.");
      return;
    }

    try {
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
      if (response.ok) {
        setSuccessMessage("Tattoo artist profile created successfully!");
        setArtistData({
          title: "",
          phone: "",
          description: "",
          city: "",
          instagramLink: "",
          facebookLink: "",
        });

        // Redirect to the artist page after successful creation
        navigate(`/artist/${userUid}`); // Replace with the actual path to the artist page
      } else {
        setErrorMessage(data.message || "Failed to create profile.");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      console.error("Error creating artist profile:", error);
    }
  };

  return (
    <Container className="mt-5">
      <h2>Create Tattoo Artist Profile</h2>
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={artistData.title}
            onChange={handleInputChange}
            placeholder="Enter your title"
            required
          />
        </Form.Group>
        <Form.Group controlId="formPhone">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            name="phone"
            value={artistData.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
            required
          />
        </Form.Group>
        <Form.Group controlId="formDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={artistData.description}
            onChange={handleInputChange}
            placeholder="Enter a description"
            required
          />
        </Form.Group>
        <Form.Group controlId="formCity">
          <Form.Label>City</Form.Label>
          <Form.Control
            type="text"
            name="city"
            value={artistData.city}
            onChange={handleInputChange}
            placeholder="Enter your city"
            required
          />
        </Form.Group>
        <Form.Group controlId="formInstagram">
          <Form.Label>Instagram Link</Form.Label>
          <Form.Control
            type="text"
            name="instagramLink"
            value={artistData.instagramLink}
            onChange={handleInputChange}
            placeholder="Enter your Instagram link"
          />
        </Form.Group>
        <Form.Group controlId="formFacebook">
          <Form.Label>Facebook Link</Form.Label>
          <Form.Control
            type="text"
            name="facebookLink"
            value={artistData.facebookLink}
            onChange={handleInputChange}
            placeholder="Enter your Facebook link"
          />
        </Form.Group>
        <Button variant="success" type="submit" className="w-100">
          Create Profile
        </Button>
      </Form>
    </Container>
  );
};

export default CreateArtistPage;
