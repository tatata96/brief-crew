import React from 'react'
import './Crew.css'

const Crew = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Creative Director",
      image: "https://via.placeholder.com/200x200/4facfe/ffffff?text=Sarah",
      bio: "Passionate about creating innovative design solutions that connect with audiences on a deeper level.",
      skills: ["UI/UX Design", "Brand Strategy", "Creative Direction"],
      experience: "8+ years"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Lead Developer",
      image: "https://via.placeholder.com/200x200/00f2fe/ffffff?text=Michael",
      bio: "Full-stack developer with expertise in modern web technologies and scalable architecture.",
      skills: ["React", "Node.js", "Python", "AWS"],
      experience: "6+ years"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Marketing Specialist",
      image: "https://via.placeholder.com/200x200/4facfe/ffffff?text=Emily",
      bio: "Strategic marketing professional focused on driving growth through data-driven campaigns.",
      skills: ["Digital Marketing", "SEO", "Analytics", "Content Strategy"],
      experience: "5+ years"
    },
    {
      id: 4,
      name: "David Thompson",
      role: "Project Manager",
      image: "https://via.placeholder.com/200x200/00f2fe/ffffff?text=David",
      bio: "Experienced project manager ensuring smooth delivery and client satisfaction.",
      skills: ["Agile", "Scrum", "Client Relations", "Risk Management"],
      experience: "7+ years"
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "UX Researcher",
      image: "https://via.placeholder.com/200x200/4facfe/ffffff?text=Lisa",
      bio: "User experience researcher dedicated to understanding user needs and behaviors.",
      skills: ["User Research", "Usability Testing", "Data Analysis", "Prototyping"],
      experience: "4+ years"
    },
    {
      id: 6,
      name: "Alex Martinez",
      role: "Frontend Developer",
      image: "https://via.placeholder.com/200x200/00f2fe/ffffff?text=Alex",
      bio: "Frontend specialist creating beautiful, responsive, and accessible user interfaces.",
      skills: ["JavaScript", "CSS", "React", "Accessibility"],
      experience: "5+ years"
    }
  ]

  return (
    <div className="crew-container">
      <div className="crew-content">
        <h1 className="crew-title">Meet Our Crew</h1>
        <p className="crew-subtitle">
          The talented team behind Brief Crew's success
        </p>
        
        <div className="team-grid">
          {teamMembers.map((member) => (
            <div key={member.id} className="member-card">
              <div className="member-image">
                <img src={member.image} alt={member.name} />
                <div className="member-overlay">
                  <span className="member-experience">{member.experience}</span>
                </div>
              </div>
              <div className="member-info">
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">{member.role}</p>
                <p className="member-bio">{member.bio}</p>
                <div className="member-skills">
                  {member.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="crew-cta">
          <h2>Join Our Team</h2>
          <p>We're always looking for talented individuals to join our crew</p>
          <button className="join-button">View Open Positions</button>
        </div>
      </div>
    </div>
  )
}

export default Crew 