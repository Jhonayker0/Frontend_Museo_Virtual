import { Canvas } from '@react-three/fiber';
import { VRButton, XR, createXRStore } from '@react-three/xr';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import VirtualGallery from './VirtualGallery';
import { useState } from 'react';
import type { Artwork } from '../../services/artworkService';

interface ARGalleryProps {
  artworks: Artwork[];
}

/**
 * Componente principal de la galería AR/VR para Meta Quest 2
 * Utiliza WebXR para renderizar la experiencia inmersiva
 */
export default function ARGallery({ artworks }: ARGalleryProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const store = createXRStore();

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Botón para entrar en modo VR - Compatible con Meta Quest 2 */}
      <VRButton
        store={store}
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: '#1a73e8',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      />

      <Canvas
        style={{ background: '#1a1a2e' }}
        gl={{ 
          antialias: true,
          alpha: false,
          // Configuración optimizada para Quest 2
          powerPreference: 'high-performance',
        }}
      >
        {/* XR: Habilita WebXR (VR/AR) */}
        <XR store={store}>
          {/* Iluminación del espacio 3D */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />

          {/* Cámara con perspectiva */}
          <PerspectiveCamera makeDefault position={[0, 1.6, 5]} />

          {/* Galería virtual con las obras de arte */}
          <VirtualGallery 
            artworks={artworks}
            onSelectArtwork={setSelectedArtwork}
          />

          {/* Entorno HDR para reflejos y ambiente realista */}
          <Environment preset="sunset" />

          {/* Controles para navegación con mouse (modo no-VR) */}
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            target={[0, 1.6, 0]}
          />
        </XR>
      </Canvas>

      {/* Panel de información de la obra seleccionada (overlay 2D) */}
      {selectedArtwork && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            padding: '20px',
            borderRadius: '12px',
            maxWidth: '400px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h2 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>
            {selectedArtwork.title}
          </h2>
          {selectedArtwork.artist && (
            <p style={{ margin: '5px 0', opacity: 0.9 }}>
              <strong>Artista:</strong> {selectedArtwork.artist}
            </p>
          )}
          <p style={{ margin: '5px 0', opacity: 0.8 }}>
            <strong>Museo:</strong> {selectedArtwork.museum}
          </p>
          {selectedArtwork.dated && (
            <p style={{ margin: '5px 0', opacity: 0.8 }}>
              <strong>Fecha:</strong> {selectedArtwork.dated}
            </p>
          )}
          {selectedArtwork.medium && (
            <p style={{ margin: '5px 0', fontSize: '14px', opacity: 0.7 }}>
              {selectedArtwork.medium}
            </p>
          )}
          <button
            onClick={() => setSelectedArtwork(null)}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              backgroundColor: '#1a73e8',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
