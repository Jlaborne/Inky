import React, { useState } from "react";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user", // Default role is set to "user"
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Handle input change for text fields (first name, last name, email, etc.)
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle role change when the checkbox is clicked
  const handleRoleChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      role: value, // Set role to the value of the selected checkbox
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage("User registered successfully!");
        setErrorMessage(""); // Clear any previous errors
      } else {
        setErrorMessage(data.message || "An error occurred");
        setSuccessMessage(""); // Clear success message in case of error
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("An error occurred while registering");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Checkboxes for role selection */}
        <div>
          <label>Role:</label>
          <div>
            <input
              type="radio"
              id="userRole"
              name="role"
              value="user"
              checked={formData.role === "user"}
              onChange={handleRoleChange}
            />
            <label htmlFor="userRole">User</label>
          </div>
          <div>
            <input
              type="radio"
              id="tattooRole"
              name="role"
              value="tattoo"
              checked={formData.role === "tattoo"}
              onChange={handleRoleChange}
            />
            <label htmlFor="tattooRole">Tattoo Artist</label>
          </div>
        </div>

        <button type="submit">Register</button>
      </form>

      {/* Display success or error messages */}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default Register;
