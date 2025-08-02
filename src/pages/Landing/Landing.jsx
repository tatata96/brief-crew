import React from 'react'
import './Landing.css'

const Landing = () => {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="hero-section">
          <h1 className="hero-title">
            Welcome to <span className="highlight">Brief Crew</span>
          </h1>
          <p className="hero-subtitle">
            We create innovative digital solutions that transform ideas into reality
          </p>
          <div className="hero-description">
            <p>
              Brief Crew is your partner in digital excellence. We combine creativity, 
              technology, and strategic thinking to deliver exceptional results that drive 
              your business forward.
            </p>
          </div>
          <div className="hero-actions">
            <button className="primary-button">Get Started</button>
            <button className="secondary-button">Learn More</button>
          </div>
        </div>
        
        <div className="features-section">
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon">🚀</div>
              <h3>Fast Delivery</h3>
              <p>Quick turnaround times without compromising quality</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💡</div>
              <h3>Innovation</h3>
              <p>Cutting-edge solutions using latest technologies</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🤝</div>
              <h3>Collaboration</h3>
              <p>Close partnership throughout the entire process</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing 