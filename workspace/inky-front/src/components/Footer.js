import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="text-center mt-4">
      <Container>
        <p>© {new Date().getFullYear()} Inky Web App. Tous droits réservés.</p>
      </Container>
    </footer>
  );
};

export default Footer;