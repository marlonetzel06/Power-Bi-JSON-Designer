import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@fontsource/ibm-plex-sans/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/titillium-web/700.css'
import '@fontsource/titillium-web/900.css'
import './index.css'
import App from './App.jsx'
import { EmbedProvider } from './embed/EmbedProvider'
import ErrorBoundary from './components/ErrorBoundary'
import { DevGallery } from './preview/DevGallery'

const isGallery = import.meta.env.DEV && new URLSearchParams(window.location.search).get('dev') === 'gallery'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      {isGallery ? (
        <DevGallery />
      ) : (
        <EmbedProvider>
          <App />
        </EmbedProvider>
      )}
    </ErrorBoundary>
  </StrictMode>,
)
