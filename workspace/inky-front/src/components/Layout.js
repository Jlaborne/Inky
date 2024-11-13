import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {

  const layoutStyle = {
    minHeight: '100vh', // Full viewport height
    backgroundImage: 'url(/bg3test2.jpg)', // Replace with the actual path
    backgroundSize: 'cover',  // Ensures the image covers the entire area
    backgroundPosition: 'center', // Centers the background
  };

  return (
    <div style={layoutStyle}>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
