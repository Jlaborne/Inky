import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Card,
  Container,
  Row,
  Col,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthProvider";
import { signIn } from "../firebase/auth";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, authLoading, userRole } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    email: "",
    password: "",
    role: "user",
  });
  const [feedbackMessage, setFeedbackMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (currentUser) {
      if (!userRole) return;
      navigate(userRole === "tattoo" ? "/create-artist" : "/artists");
    }
  }, [currentUser, userRole, authLoading, navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Submit handler for both login and register actions
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        setFeedbackMessage({ type: "success", text: "Connexion réussie !" });
      } else {
        const res = await fetch(
          `${
            process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"
          }/auth/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );
        if (!res.ok) throw new Error("Échec de l'inscription.");
        setFeedbackMessage({
          type: "success",
          text: "Compte créé avec succès ! Veuillez vous connecter.",
        });
        setFormData({
          lastName: "",
          firstName: "",
          email: "",
          password: "",
          role: "user",
        });
        setIsLogin(true);
      }
    } catch (error) {
      setFeedbackMessage({
        type: "danger",
        text: error.message || "An error occurred. Please try again.",
      });
    }
  };

  return (
    <Container className="mt-5">
      <header className="text-center mb-4">
        <h1>Inky Web App</h1>
        <p>Votre application dédiée aux flash tattoo.</p>
      </header>

      <div className="text-center mb-4">
        <Button
          variant={isLogin ? "primary" : "outline-primary"}
          onClick={() => setIsLogin(true)}
          className={`me-2 ${isLogin ? "active" : ""}`}
        >
          Se connecter
        </Button>
        <Button
          variant={!isLogin ? "primary" : "outline-secondary"}
          onClick={() => setIsLogin(false)}
          className={!isLogin ? "active" : ""}
        >
          Créer un compte
        </Button>
      </div>

      {feedbackMessage.text && (
        <Alert variant={feedbackMessage.type}>{feedbackMessage.text}</Alert>
      )}

      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="p-4 shadow-sm rounded">
            <h2 className="text-center mb-3">
              {isLogin ? "Connexion" : "Créer un compte"}
            </h2>
            <Form onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <Form.Group controlId="formLastName" className="mb-3">
                    <Form.Label>Nom de famille</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Entrer votre Nom de famille"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formFirstName" className="mb-3">
                    <Form.Label>Prénom</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Entrer votre Prénom"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Etes vous tatoueur ?</Form.Label>
                    <Form.Check
                      type="radio"
                      name="role"
                      label="Non"
                      value="user"
                      checked={formData.role === "user"}
                      onChange={handleInputChange}
                      className="ms-2"
                    />
                    <Form.Check
                      type="radio"
                      name="role"
                      label="Oui"
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
                  placeholder="Entrer votre email"
                  required
                />
              </Form.Group>
              <Form.Group controlId="formPassword" className="mb-3">
                <Form.Label>Mot de passe</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Mot de passe"
                  required
                />
              </Form.Group>
              <Button variant="success" type="submit" className="w-100">
                {isLogin ? "Connexion" : "Créer un compte"}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
