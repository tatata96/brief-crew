import React, { useRef, useEffect, useState } from "react";
import "./About.css";
import AboutScene from "./AboutScene";

const About = () => {
  const aboutSceneRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the section is visible for more responsive animation
        rootMargin: "0px 0px -50px 0px" // Start animation even earlier
      }
    );

    if (aboutSceneRef.current) {
      observer.observe(aboutSceneRef.current);
    }

    return () => {
      if (aboutSceneRef.current) {
        observer.unobserve(aboutSceneRef.current);
      }
    };
  }, []);

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

      </div>

      <div className="about-scene-container" ref={aboutSceneRef}>
        {isVisible && <AboutScene />}
      </div>
    </div>
  );
};

export default About;
