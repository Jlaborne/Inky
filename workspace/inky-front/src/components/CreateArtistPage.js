import React, { useState, useEffect } from "react";
import { Button, Form, Container, Alert } from "react-bootstrap";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserUid(user.uid);
        
        // Check if the artist profile already exists
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(`http://localhost:5000/api/artists/${user.uid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // If artist exists, redirect to their profile page
          navigate(`/artist/${user.uid}`);
        } else if (response.status !== 404) {
          console.error("Error checking artist profile:", response.statusText);
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
          instagram_link: "",
          facebook_link: "",
        });

        // Redirect to the artist page after successful creation
        navigate(`/artist/${userUid}`);
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
        <Form.Group controlId="formInstagramLink">
          <Form.Label>Instagram Link</Form.Label>
          <Form.Control
            type="text"
            name="instagram_link"
            value={artistData.instagram_link}
            onChange={handleInputChange}
            placeholder="Enter your Instagram link"
          />
        </Form.Group>
        <Form.Group controlId="formFacebookLink">
          <Form.Label>Facebook Link</Form.Label>
          <Form.Control
            type="text"
            name="facebook_link"
            value={artistData.facebook_link}
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