import { useState, useEffect } from 'react'
import './App.scss'
import Landing from './pages/Landing/Landing'
import About from './pages/About/About'
import Work from './pages/Work/Work'
import Crew from './pages/Crew/Crew'
import TypographyTest from './components/TypographyTest'
import Footer from './components/Footer'

function App() {
  const [activeSection, setActiveSection] = useState('landing')

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['landing', 'about', 'work', 'crew']
      const scrollPosition = window.scrollY + 100 // Offset for header

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i])
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="app">
      {/* Fixed Header */}
      <header className="main-header">
        <div className="header-content">
          <h1 className="typography--tropikal-display logo" onClick={() => scrollToSection('landing')}>
            BRIEF CREW
          </h1>
          <nav className="navigation">
            <ul className="nav-menu typography--h5">
              <li>
                <button 
                  className={`nav-item ${activeSection === 'landing' ? 'active' : ''}`}
                  onClick={() => scrollToSection('landing')}
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  className={`nav-item ${activeSection === 'about' ? 'active' : ''}`}
                  onClick={() => scrollToSection('about')}
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  className={`nav-item ${activeSection === 'work' ? 'active' : ''}`}
                  onClick={() => scrollToSection('work')}
                >
                  Work
                </button>
              </li>
              <li>
                <button 
                  className={`nav-item ${activeSection === 'crew' ? 'active' : ''}`}
                  onClick={() => scrollToSection('crew')}
                >
                  Crew
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <section id="landing" className="section landing-section">
          <Landing />
        </section>
        
        <section id="about" className="section about-section">
          <About />
        </section>
        
        <section id="work" className="section work-section">
          <Work />
        </section>
        
        <section id="crew" className="section crew-section">
          <Crew />
        </section>
        
      </main>
      
      <Footer />
    </div>
  )
}

export default App
