import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import './FaceUploadPage.css';

const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" fill="%23e5e7eb"/><circle cx="80" cy="60" r="36" fill="%23cbd5f5"/><path d="M80 100c-33 0-60 18-60 40h120c0-22-27-40-60-40z" fill="%23dbeafe"/></svg>';

function FaceUploadPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | undefined>(undefined);
  const [previewSrc, setPreviewSrc] = useState<string>(DEFAULT_AVATAR);
  const [isUploaded, setIsUploaded] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];

    if (!file) {
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const nextSrc = URL.createObjectURL(file);
    objectUrlRef.current = nextSrc;
    setPreviewSrc(nextSrc);
    setIsUploaded(true);

    event.target.value = '';
  };

  return (
    <main className="face-upload-page">
      <div className="face-upload-card">
        <img
          className="face-upload-avatar"
          src={previewSrc}
          alt="Profile preview"
        />
        <button
          className="face-upload-button"
          type="button"
          onClick={handleButtonClick}
        >
          Take Photo
        </button>
        {isUploaded && (
          <div className="upload-success-message">
            Upload successful!
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </main>
  );
}

export default FaceUploadPage;
