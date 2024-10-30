import React, { useState, useEffect  } from "react";
import { Button, Form, Container, Alert } from "react-bootstrap";
import { auth } from "../firebase/firebase";

const TattooArtistPage = () => {
  const [artistData, setArtistData] = useState({
    title: "",
    phone: "",
    email: "",
    instagramLink: "",
    facebookLink: "",
  });
  const [userUid, setUserUid] = useState(null); // Store user UID
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserUid(user.uid);
        console.log("User UID:", user.uid);
      } else {
        console.error("Auth state changed but no user found. Please log in again.");
      }
    });

    return () => unsubscribe(); // Clean up listener on unmount
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
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...artistData, userUid }), // Include user UID in the payload
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage("Tattoo artist profile created successfully!");
        setArtistData({
          title: "",
          phone: "",
          email: "",
          instagramLink: "",
          facebookLink: "",
        });
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
        <Form.Group controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={artistData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
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

export default TattooArtistPage;
