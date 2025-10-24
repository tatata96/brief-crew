import './AlbumsPage.css';

function AlbumsPage() {
  const albums = [
    { id: 1, name: 'Vacation 2024', photoCount: 45, coverPhoto: 'https://picsum.photos/200/200?random=20' },
    { id: 2, name: 'Family Photos', photoCount: 23, coverPhoto: 'https://picsum.photos/200/200?random=21' },
    { id: 3, name: 'Nature', photoCount: 67, coverPhoto: 'https://picsum.photos/200/200?random=22' },
    { id: 4, name: 'Friends', photoCount: 34, coverPhoto: 'https://picsum.photos/200/200?random=23' },
    { id: 5, name: 'Food', photoCount: 12, coverPhoto: 'https://picsum.photos/200/200?random=24' },
    { id: 6, name: 'Pets', photoCount: 28, coverPhoto: 'https://picsum.photos/200/200?random=25' },
    { id: 7, name: 'Work', photoCount: 8, coverPhoto: 'https://picsum.photos/200/200?random=26' },
    { id: 8, name: 'Holidays', photoCount: 56, coverPhoto: 'https://picsum.photos/200/200?random=27' },
  ];

  return (
    <div className="albums-page">
      <div className="page-header">
        <h2>Albums</h2>
        <p className="album-count">{albums.length} albums</p>
      </div>
      
      <div className="albums-grid">
        {albums.map((album) => (
          <div key={album.id} className="album-item">
            <div className="album-cover">
              <img 
                src={album.coverPhoto} 
                alt={album.name}
                className="album-image"
                loading="lazy"
              />
              <div className="album-overlay">
                <span className="album-photo-count">{album.photoCount}</span>
              </div>
            </div>
            <div className="album-info">
              <h3 className="album-name">{album.name}</h3>
              <p className="album-photos">{album.photoCount} photos</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumsPage;
