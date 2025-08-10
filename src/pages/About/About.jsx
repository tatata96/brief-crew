import React from "react";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
      <h1 className="typography--dirtyline-heading">About</h1>
      <h1 className="typography--dirtyline-heading">Brief Crew</h1>

      </div>

      <div className="about-content">
        <div className="about-text">
          <p className="typography--body-large">
            We're a group of creative misfits who love thinking outside the box,
            tinkering, experimenting, dreaming, and – most importantly – working
            with cool people on new projects.
          </p>
          <p className="typography--h5-medium">
            a proactive team of designers and developers who love creating brand
            and digital experiences that matter.
          </p>
        </div>
        <div className="about-stats">
          <div className="stat-item">
            <h3>50+</h3>
            <p>Projects Completed</p>
          </div>
          <div className="stat-item">
            <h3>25+</h3>
            <p>Happy Clients</p>
          </div>
          <div className="stat-item">
            <h3>5+</h3>
            <p>Years Experience</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
