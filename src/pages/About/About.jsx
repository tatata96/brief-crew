import React, {useRef, useEffect, useState} from "react";
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
        rootMargin: "0px 0px -50px 0px", // Start animation even earlier
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
        <h1 className="typography--tropikal-display">About</h1>
      </div>

      <div className="about-content">
        <div className="about-text">
          <p className="typography--body-large">
            We’re Brief Crew, an event planning studio led by three women
            with three complementary superpowers: an engineer’s precision, an
            auditor’s rigor, and an agency producer’s creative flair.      <br /> Together,
            we turn ideas into unforgettable experiences—beautifully designed,
            flawlessly executed, and perfectly on-budget. 
            <br />      <br />
            From intimate dinners
            and private celebrations to brand activations, corporate offsites,
            and weddings, we plan every kind of event. We handle it end-to-end:
            concept and moodboards, venue scouting, production timelines, vendor
            management, guest communications, and on-site direction—so you can
            actually enjoy your own event. Our network is deep and flexible.
            <br />
            <br />Think: production crews, set design and styling, florists, lighting
            & A/V, photographers and videographers, live entertainment, and
            seriously good food—from boutique caterers to chef-led tasting menus
            and cocktail bars. We curate the right team for your vision,
            culture, and budget to create the ambiance (and memories) people
            talk about long after the night ends.
          </p>
         {/*<p style={{ whiteSpace: 'pre-line' , textAlign: 'left'}} className="typography--h5-medium about-text-2">
            <p style={{ fontWeight: 'bold' }}>How we work:</p>
            Design + logistics in balance. <br />
            Creative concepts backed<br />
            by detailed run-of-show and risk planning. <br />
            Transparent budgeting.<br />
            Clear quotes, no surprises. Quality, sustainably minded. Where
            possible, we source locally and minimize waste. <br />
            Flexible &
            inclusive. We build experiences for diverse tastes, teams, and
            traditions. <br />
            
            Based in Istanbul, working across Turkey and Europe. Let’s plan something
            unforgettable—start with a brief and we’ll take it from there.
          </p>
          */}
        </div>
      </div>

      <div className="about-scene-container" ref={aboutSceneRef}>
        {isVisible && <AboutScene />}
      </div>
    </div>
  );
};

export default About;
