import React, {useRef, useEffect, useState} from "react";
import './Work.css'
import Header from "../../components/Header";


const Work = () => {
  const projects = [
    {
      id: 1,
      title: "Efes Lansman",
      description: "A modern e-commerce solution with advanced features and seamless user experience.",
      category: "Efes Lansman",
      image: "./events/image.png"
    },
    {
      id: 2,
      title: "Cocktail Bar Opening",
      description: "Innovative mobile application with intuitive design and powerful functionality.",
      category: "Cocktail Bar Opening",
      image: "./events/image-2.png"
    },
    {
      id: 3,
      title: "Cafe Opening",
      description: "Complete brand identity design including logo, colors, and marketing materials.",
      category: "Cafe Opening",
      image: "./events/image-3.png"
    }
  ]
  const aboutSceneRef = useRef(null);

    const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = aboutSceneRef.current;
    if (!el) return;
  
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          io.unobserve(entry.target); // fire once
        }
      },
      {
        root: null,
        // Start ~400px before the element actually enters the viewport
        rootMargin: '400px 0px 400px 0px',
        threshold: 0, // fire as soon as it touches the extended root
      }
    );
  
    io.observe(el);
    return () => io.disconnect();
  }, []);
  
  return (
    <div className="work-container">
      <div className="work-content"  ref={aboutSceneRef}>
        <Header text="Works" trigger={isVisible} />

        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-image">
                <img src={project.image} alt={project.title} />
                <div className="project-overlay">
                  <span className="project-category">{project.category}</span>
                </div>
              </div>
              <div className="project-info">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <button className="project-button">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Work 