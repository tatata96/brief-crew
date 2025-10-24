import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import './UploadPhotosPage.css';

type SelectedPhoto = {
  file: File;
  url: string;
};

function UploadPhotosPage() {
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedPhotosRef = useRef<SelectedPhoto[]>([]);

  useEffect(() => {
    selectedPhotosRef.current = selectedPhotos;
  }, [selectedPhotos]);

  useEffect(() => {
    return () => {
      selectedPhotosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url));
    };
  }, []);

  const handleAddPhotosClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    setSelectedPhotos((previous) => {
      const next = [...previous];

      files.forEach((file) => {
        next.push({
          file,
          url: URL.createObjectURL(file),
        });
      });

      return next;
    });

    event.target.value = '';
  };

  return (
    <div className="upload-photos-page">
      <section className="upload-card">
 

        <button type="button" className="upload-button" onClick={handleAddPhotosClick}>
          Add photos
        </button>

        <input
          ref={fileInputRef}
          className="file-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
      </section>

      <section className="selected-photos">
        <h2>Selected photos</h2>
        {selectedPhotos.length === 0 ? (
          <p className="placeholder">Nothing selected yet — tap “Add photos” to get started.</p>
        ) : (
          <div className="photo-grid">
            {selectedPhotos.map((photo, index) => (
              <figure key={`${photo.file.name}-${index}`} className="photo-thumbnail">
                <img src={photo.url} alt={photo.file.name || `Selected photo ${index + 1}`} />
              </figure>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default UploadPhotosPage;
