import './PhotosPage.css';

function PhotosPage() {
  // Sample photo data
  const photos = [
    { id: 1, url: 'https://picsum.photos/300/300?random=1', title: 'Photo 1' },
    { id: 2, url: 'https://picsum.photos/300/300?random=2', title: 'Photo 2' },
    { id: 3, url: 'https://picsum.photos/300/300?random=3', title: 'Photo 3' },
    { id: 4, url: 'https://picsum.photos/300/300?random=4', title: 'Photo 4' },
    { id: 5, url: 'https://picsum.photos/300/300?random=5', title: 'Photo 5' },
    { id: 6, url: 'https://picsum.photos/300/300?random=6', title: 'Photo 6' },
    { id: 7, url: 'https://picsum.photos/300/300?random=7', title: 'Photo 7' },
    { id: 8, url: 'https://picsum.photos/300/300?random=8', title: 'Photo 8' },
    { id: 9, url: 'https://picsum.photos/300/300?random=9', title: 'Photo 9' },
    { id: 10, url: 'https://picsum.photos/300/300?random=10', title: 'Photo 10' },
    { id: 11, url: 'https://picsum.photos/300/300?random=11', title: 'Photo 11' },
    { id: 12, url: 'https://picsum.photos/300/300?random=12', title: 'Photo 12' },
  ];

  return (
    <div className="photos-page">
      <div className="page-header">
        <h2>All Photos</h2>
        <p className="photo-count">{photos.length} photos</p>
      </div>
      
      <div className="photos-grid">
        {photos.map((photo) => (
          <div key={photo.id} className="photo-item">
            <img 
              src={photo.url} 
              alt={photo.title}
              className="photo-image"
              loading="lazy"
            />
            <div className="photo-overlay">
              <span className="photo-title">{photo.title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotosPage;
