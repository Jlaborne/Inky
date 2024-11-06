import React, { useState } from "react";
import { Button, Form, Card, Container, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { signIn } from "../firebase/auth"; // Adjust the path if necessary

const Home = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    email: "",
    password: "",
    role: "user",
  });
  const [feedbackMessage, setFeedbackMessage] = useState({ type: "", text: "" });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Submit handler for both login and register actions
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response, userCredential;

      if (isLogin) {
        userCredential = await signIn(formData.email, formData.password);
        const role = await fetchUserRole(userCredential.user.uid);
        navigate(role === "tattoo" ? "/create-artist" : "/artists");
        setFeedbackMessage({ type: "success", text: "Login successful!" });
      } else {
        response = await fetch("http://localhost:5000/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) throw new Error("Registration failed.");
        setFeedbackMessage({ type: "success", text: "User registered successfully!" });
        setFormData({ lastName: "", firstName: "", email: "", password: "", role: "user" });
      }
    } catch (error) {
      setFeedbackMessage({ type: "danger", text: error.message || "An error occurred. Please try again." });
    }
  };

  // Fetch user role function
  const fetchUserRole = async (uid) => {
    const response = await fetch(`http://localhost:5000/api/users/${uid}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user role");
    }
    const data = await response.json();
    return data.role;
  };

  return (
    <Container className="mt-5">
      <header className="text-center mb-4">
        <h1>Inky Web App</h1>
        <p>Votre application dédiée aux flash tattoo.</p>
      </header>

      <div className="text-center mb-4">
        <Button
          variant="outline-primary"
          onClick={() => setIsLogin(true)}
          className={`me-2 ${isLogin ? "active" : ""}`}
        >
          Se connecter
        </Button>
        <Button variant="outline-secondary" onClick={() => setIsLogin(false)}>
          Créer un compte
        </Button>
      </div>

      {feedbackMessage.text && (
        <Alert variant={feedbackMessage.type}>{feedbackMessage.text}</Alert>
      )}

      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="p-4 shadow-sm rounded">
            <h2 className="text-center mb-3">{isLogin ? "Login" : "Register"}</h2>
            <Form onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <Form.Group controlId="formLastName" className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formFirstName" className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Select Role</Form.Label>
                    <Form.Check
                      type="radio"
                      name="role"
                      label="User"
                      value="user"
                      checked={formData.role === "user"}
                      onChange={handleInputChange}
                      className="ms-2"
                    />
                    <Form.Check
                      type="radio"
                      name="role"
                      label="Tattoo Artist"
                      value="tattoo"
                      onChange={handleInputChange}
                      className="ms-2"
                    />
                  </Form.Group>
                </>
              )}
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </Form.Group>
              <Form.Group controlId="formPassword" className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  required
                />
              </Form.Group>
              <Button variant="success" type="submit" className="w-100">
                {isLogin ? "Login" : "Register"}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
