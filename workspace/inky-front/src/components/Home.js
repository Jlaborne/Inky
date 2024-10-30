import React, { useState } from "react";
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
import { signUp, signIn } from '../firebase/auth'; // Adjust the import path if necessary

const Home = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // State to toggle between login and register
  const [registerData, setRegisterData] = useState({
    lastName: "",
    firstName: "",
    email: "",
    password: "",
    role: "user", // Default role
  });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData), // Send the registration data
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage("User registered successfully!");
        setErrorMessage(""); // Clear any previous error messages
        setRegisterData({
          lastName: "",
          firstName: "",
          email: "",
          password: "",
          role: "user",
        });
      } else {
        setErrorMessage(data.message || "Registration failed.");
        setSuccessMessage(""); // Clear any previous success messages
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      console.error("Error during registration:", error);
    }
  };

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signIn(loginData.email, loginData.password);
      const user = userCredential.user;

      // Fetch user role from your backend
      const role = await fetchUserRole(user.uid); // Implement this function

      // Redirect based on user role
      if (role === "tattoo") {
        navigate("/create-tattoo-artist-page"); // Redirect to tattoo artist page
      } else {
        setSuccessMessage("Login successful!");
        setErrorMessage(""); // Clear any previous error messages
        navigate("/user-home-page"); // Adjust this route as necessary
      }
    } catch (error) {
      setErrorMessage(error.message || "Login failed.");
      setSuccessMessage(""); // Clear any previous success messages
    }
  };

  // Function to fetch user role
  const fetchUserRole = async (uid) => {
    const response = await fetch(`http://localhost:5000/api/users/${uid}`); // Adjust endpoint as necessary
    if (!response.ok) {
      throw new Error("Failed to fetch user role");
    }
    const data = await response.json();
    return data.role; // Assuming your response has a role field
  };

  return (
    <Container className="mt-5">
      <header className="text-center mb-4">
        <h1>Inky Web App</h1>
        <p>Votre application dédiée aux flash tatoo.</p>
      </header>

      {/* Toggle Buttons */}
      <div className="text-center mb-4">
        <Button
          variant="outline-primary"
          onClick={() => setIsLogin(true)}
          className="me-2"
        >
          Se connecter
        </Button>
        <Button variant="outline-secondary" onClick={() => setIsLogin(false)}>
          Créer un compte
        </Button>
      </div>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="p-4">
            <h2 className="text-center mb-3">
              {isLogin ? "Login" : "Register"}
            </h2>
            <Form onSubmit={isLogin ? handleSubmitLogin : handleSubmitRegister}>
              {isLogin ? (
                <>
                  <Form.Group controlId="formEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginInputChange}
                      placeholder="Enter your email"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formPasswordLogin">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginInputChange}
                      placeholder="Password"
                      required
                    />
                  </Form.Group>
                </>
              ) : (
                <>
                  <Form.Group controlId="formLastName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={registerData.lastName}
                      onChange={handleRegisterInputChange}
                      placeholder="Enter your last name"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formFirstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={registerData.firstName}
                      onChange={handleRegisterInputChange}
                      placeholder="Enter your first name"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formEmailRegister">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterInputChange}
                      placeholder="Enter your email"
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="formPasswordRegister">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterInputChange}
                      placeholder="Password"
                      required
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label>Select Role</Form.Label>
                    <Form.Check
                      type="radio"
                      name="role"
                      label="User"
                      value="user"
                      checked={registerData.role === "user"}
                      onChange={handleRegisterInputChange}
                    />
                    <Form.Check
                      type="radio"
                      name="role"
                      label="Tattoo Artist"
                      value="tattoo"
                      onChange={handleRegisterInputChange}
                    />
                  </Form.Group>
                </>
              )}
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
