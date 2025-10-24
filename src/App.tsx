import { useState } from 'react'
import Header from './components/Header'
import PhotosPage from './pages/PhotosPage'
import AlbumsPage from './pages/AlbumsPage'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('photos')

  function renderCurrentPage() {
    switch (currentPage) {
      case 'face-recognition':
        return <PhotosPage />
      case 'upload-photos':
        return <AlbumsPage />
      case 'see-photos':
        return <PhotosPage />
      default:
        return <PhotosPage />
    }
  }

  return (
    <div className="app">
      <Header onPageChange={setCurrentPage} currentPage={currentPage} />
      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  )
}

export default App
