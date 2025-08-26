import React, {useRef, useEffect, useState} from "react";
import './Crew.css'
import Header from "../../components/Header";


const Crew = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Creative Director",
      image: "./people/image.png",
      bio: "Passionate about creating innovative design solutions that connect with audiences on a deeper level.",
      skills: ["UI/UX Design", "Brand Strategy", "Creative Direction"],
      experience: "8+ years"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Lead Developer",
      image: "./people/image.png",
      bio: "Full-stack developer with expertise in modern web technologies and scalable architecture.",
      skills: ["React", "Node.js", "Python", "AWS"],
      experience: "6+ years"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Marketing Specialist",
      image: "./people/image.png",
      bio: "Strategic marketing professional focused on driving growth through data-driven campaigns.",
      skills: ["Digital Marketing", "SEO", "Analytics", "Content Strategy"],
      experience: "5+ years"
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
    <div className="crew-container">
      <div className="crew-content" ref={aboutSceneRef}>
      <Header text="Meet the Crew" trigger={isVisible} />

        
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
      
              </div>
            </div>
          ))}
        </div>
      
      </div>
    </div>
  )
}

export default Crew 