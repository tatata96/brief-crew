import { useState } from 'react';
import './Header.css';

interface HeaderProps {
  onPageChange: (page: string) => void;
  currentPage: string;
}

function Header({ onPageChange, currentPage }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const menuItems = [
    { id: 'face-recognition', label: 'Face Recognition', count: 12 },
    { id: 'upload-photos', label: 'Upload Photos', count: 2342 },
    { id: 'see-photos', label: 'Display Photos', count: 156 }
  ];

  function toggleDropdown() {
    setIsDropdownOpen(!isDropdownOpen);
  }

  function handleMenuItemClick(pageId: string) {
    onPageChange(pageId);
    setIsDropdownOpen(false);
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <h1>PHOTOLA</h1>
        </div>
        
        <div className="header-actions">
          <button 
            className="menu-button"
            onClick={toggleDropdown}
            aria-label="Open menu"
          >
            <div className="three-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
          
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  className={`menu-item ${currentPage === item.id ? 'active' : ''}`}
                  onClick={() => handleMenuItemClick(item.id)}
                >
                  <span className="menu-item-label">{item.label}</span>
                  <span className="menu-item-count">{item.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
