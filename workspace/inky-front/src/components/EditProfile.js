import React, { useState, useEffect } from "react";
import { useAuth } from "../firebase/AuthProvider";
import { Form, Button, Alert, Container, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { currentUser, authLoading } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    lastName: "",
    firstName: "",
    email: "",
  });
  const [loading, setLoading] = useState(true); // Loading state for user data fetch
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (authLoading) return; // Wait until authentication is resolved

    if (!currentUser) {
      // User is not authenticated, redirect or show message
      setErrorMessage("You must be logged in to edit your profile.");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const token = await currentUser.getIdToken();
        const response = await fetch(
          `http://localhost:5000/api/users/${currentUser.uid}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Error fetching user data.");

        const data = await response.json();
        setUserData({
          lastName: data.lastName,
          firstName: data.firstName,
          email: data.email,
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
    setUserData((prevData) => ({
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
      const response = await fetch(
        `http://localhost:5000/api/users/${currentUser.uid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) throw new Error("Error updating profile.");

      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  if (authLoading || loading) {
    // Show a loading indicator while authentication or data fetching is in progress
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
        <p>Loading your profile...</p>
      </Container>
    );
  }

  if (errorMessage && !currentUser) {
    // Optionally, redirect the user to the login page if not authenticated
    navigate("/");
    return null;
  }

  return (
    <Container className="mt-5">
      <h2>Edit Profile</h2>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formFirstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            name="firstName"
            value={userData.firstName}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="formLastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            name="lastName"
            value={userData.lastName}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="formEmail">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            disabled // Disable email field if you don't want users to change it
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Update
        </Button>
      </Form>
    </Container>
  );
};

export default EditProfile;
