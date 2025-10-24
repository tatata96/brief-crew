import './FavoritesPage.css';

function FavoritesPage() {
  const favoritePhotos = [
    { id: 1, url: 'https://picsum.photos/400/400?random=30', title: 'Favorite Photo 1', date: '2024-01-15' },
    { id: 2, url: 'https://picsum.photos/400/400?random=31', title: 'Favorite Photo 2', date: '2024-01-20' },
    { id: 3, url: 'https://picsum.photos/400/400?random=32', title: 'Favorite Photo 3', date: '2024-02-05' },
    { id: 4, url: 'https://picsum.photos/400/400?random=33', title: 'Favorite Photo 4', date: '2024-02-10' },
    { id: 5, url: 'https://picsum.photos/400/400?random=34', title: 'Favorite Photo 5', date: '2024-02-15' },
    { id: 6, url: 'https://picsum.photos/400/400?random=35', title: 'Favorite Photo 6', date: '2024-02-20' },
  ];

  return (
    <div className="favorites-page">
      <div className="page-header">
        <h2>Favorites</h2>
        <p className="favorite-count">{favoritePhotos.length} favorite photos</p>
      </div>
      
      <div className="favorites-grid">
        {favoritePhotos.map((photo) => (
          <div key={photo.id} className="favorite-item">
            <div className="favorite-image-container">
              <img 
                src={photo.url} 
                alt={photo.title}
                className="favorite-image"
                loading="lazy"
              />
              <div className="favorite-overlay">
                <div className="favorite-actions">
                  <button className="action-button heart-button" aria-label="Remove from favorites">
                    ♥
                  </button>
                  <button className="action-button share-button" aria-label="Share">
                    ↗
                  </button>
                </div>
              </div>
            </div>
            <div className="favorite-info">
              <h3 className="favorite-title">{photo.title}</h3>
              <p className="favorite-date">{photo.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
