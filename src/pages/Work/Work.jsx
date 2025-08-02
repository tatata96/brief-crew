import React from 'react'
import './Work.css'

const Work = () => {
  const projects = [
    {
      id: 1,
      title: "E-Commerce Platform",
      description: "A modern e-commerce solution with advanced features and seamless user experience.",
      category: "Web Development",
      image: "https://via.placeholder.com/300x200/ff6b6b/ffffff?text=E-Commerce"
    },
    {
      id: 2,
      title: "Mobile App Design",
      description: "Innovative mobile application with intuitive design and powerful functionality.",
      category: "Mobile Development",
      image: "https://via.placeholder.com/300x200/4ecdc4/ffffff?text=Mobile+App"
    },
    {
      id: 3,
      title: "Brand Identity",
      description: "Complete brand identity design including logo, colors, and marketing materials.",
      category: "Branding",
      image: "https://via.placeholder.com/300x200/45b7d1/ffffff?text=Brand+Identity"
    },
    {
      id: 4,
      title: "Digital Marketing",
      description: "Comprehensive digital marketing strategy with measurable results and ROI.",
      category: "Marketing",
      image: "https://via.placeholder.com/300x200/96ceb4/ffffff?text=Digital+Marketing"
    },
    {
      id: 5,
      title: "UI/UX Design",
      description: "User-centered design approach creating engaging and accessible interfaces.",
      category: "Design",
      image: "https://via.placeholder.com/300x200/ffeaa7/333333?text=UI+UX+Design"
    },
    {
      id: 6,
      title: "Consulting Services",
      description: "Strategic consulting to help businesses optimize their digital presence.",
      category: "Consulting",
      image: "https://via.placeholder.com/300x200/dda0dd/ffffff?text=Consulting"
    }
  ]

  return (
    <div className="work-container">
      <div className="work-content">
        <h1 className="work-title">Our Work</h1>
        <p className="work-subtitle">
          Discover our portfolio of successful projects and innovative solutions
        </p>
        
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
        
        <div className="work-cta">
          <h2>Ready to Start Your Project?</h2>
          <p>Let's create something amazing together</p>
          <button className="cta-button">Get In Touch</button>
        </div>
      </div>
    </div>
  )
}

export default Work 