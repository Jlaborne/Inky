import React from "react";

const Home = () => {
  return (
    <div className="home">
      <header className="home-header">
        <h1>Welcome to My Web App</h1>
        <p>Your one-stop platform for [your app’s purpose].</p>
        <a href="/register" className="btn">
          Get Started
        </a>
      </header>
      <section className="features">
        <div className="feature-card">
          <h3>Feature 1</h3>
          <p>Brief description of the feature.</p>
        </div>
        <div className="feature-card">
          <h3>Feature 2</h3>
          <p>Brief description of the feature.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
