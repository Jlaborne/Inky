import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

const PortfolioUploadForm = ({ onUpload }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mainImage, setMainImage] = useState(null);

  const handleFileChange = (e) => {
    setMainImage(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!mainImage || !title) return;
    onUpload({ title, description, mainImage });
  };

  return (
    <Form>
      <Form.Group controlId="formTitle">
        <Form.Label>Portfolio Title</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </Form.Group>
      
      <Form.Group controlId="formDescription">
        <Form.Label>Portfolio Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Enter a description for the portfolio"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="formFile">
        <Form.Label>Upload Main Image</Form.Label>
        <Form.Control type="file" onChange={handleFileChange} />
      </Form.Group>

      <Button onClick={handleUpload} disabled={!mainImage || !title}>
        Upload Portfolio
      </Button>
    </Form>
  );
};

export default PortfolioUploadForm;
