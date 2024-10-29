import React, { useState } from "react";
import { Button, Form, Container, Alert } from "react-bootstrap";

const TattooArtistPage = () => {
  const [artistData, setArtistData] = useState({
    title: "",
    phoneNumber: "",
    email: "",
    instagramLink: "",
    facebookLink: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setArtistData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/artists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(artistData),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage("Tattoo artist profile created successfully!");
        setArtistData({
          title: "",
          phoneNumber: "",
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
        <Form.Group controlId="formPhoneNumber">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="text"
            name="phoneNumber"
            value={artistData.phoneNumber}
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
