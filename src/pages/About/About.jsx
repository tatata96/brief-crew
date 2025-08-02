import React from 'react'
import './About.css'

const About = () => {
  return (
    <div className="about-container">
      <div className="about-content">
        <h1 className="about-title">About Brief Crew</h1>
        <div className="about-text">
          <p>
            Welcome to Brief Crew, where creativity meets innovation. We are a dynamic team 
            of passionate professionals dedicated to delivering exceptional results in every project.
          </p>
          <p>
            Founded with a vision to transform ideas into reality, we specialize in creating 
            cutting-edge solutions that drive success for our clients. Our approach combines 
            technical expertise with creative thinking to deliver projects that exceed expectations.
          </p>
          <p>
            With years of experience across various industries, our team brings diverse 
            perspectives and skills to every challenge. We believe in collaboration, 
            continuous learning, and pushing the boundaries of what's possible.
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
  )
}

export default About 