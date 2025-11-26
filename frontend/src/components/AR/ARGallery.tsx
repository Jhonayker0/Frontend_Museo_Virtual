import { Canvas } from '@react-three/fiber';
import { VRButton, XR, createXRStore } from '@react-three/xr';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import VirtualGallery from './VirtualGallery';
import { useState, useRef, useEffect } from 'react';
import type { Artwork } from '../../services/artworkService';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import artworkService from '../../services/artworkService';
import authService from '../../services/authService';

// Componente para movimiento con joystick
function PlayerMovement({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ gl }) => {
    const session = gl.xr.getSession();
    if (!session || !group.current) return;

    const currentGroup = group.current; // Guardar referencia

    session.inputSources.forEach((source) => {
      if (!source.gamepad) return;
      
      const axes = source.gamepad.axes;
      
      // Controlador izquierdo - Movimiento
      if (source.handedness === 'left') {
        let moveX = 0, moveY = 0;
        
        if (axes.length >= 4) {
          moveX = Math.abs(axes[2]) > 0.15 ? axes[2] : 0;
          moveY = Math.abs(axes[3]) > 0.15 ? axes[3] : 0;
        }
        if (moveX === 0 && moveY === 0 && axes.length >= 2) {
          moveX = Math.abs(axes[0]) > 0.15 ? axes[0] : 0;
          moveY = Math.abs(axes[1]) > 0.15 ? axes[1] : 0;
        }
        
        if (moveX !== 0 || moveY !== 0) {
          const speed = 0.05;
          
          // Obtener rotación actual del grupo
          const rotation = currentGroup.rotation.y;
          
          // Calcular dirección basada en rotación
          const forward = new THREE.Vector3(
            -Math.sin(rotation),
            0,
            -Math.cos(rotation)
          );
          const right = new THREE.Vector3(
            Math.cos(rotation),
            0,
            -Math.sin(rotation)
          );
          
          // Mover el grupo (que contiene todo el museo) - invertir forward
          currentGroup.position.x -= right.x * moveX * speed - forward.x * moveY * speed;
          currentGroup.position.z -= right.z * moveX * speed - forward.z * moveY * speed;
        }
      }
      
      // Controlador derecho - Rotación
      if (source.handedness === 'right') {
        let rotX = 0;
        
        if (axes.length >= 4) {
          rotX = Math.abs(axes[2]) > 0.15 ? axes[2] : 0;
        }
        if (rotX === 0 && axes.length >= 2) {
          rotX = Math.abs(axes[0]) > 0.15 ? axes[0] : 0;
        }
        
        if (rotX !== 0) {
          currentGroup.rotation.y += rotX * 0.02;
        }
      }
    });
  });

  return <group ref={group}>{children}</group>;
}

interface ARGalleryProps {
  artworks: Artwork[];
}

/**
 * Componente principal de la galería AR/VR para Meta Quest 2
 * Utiliza WebXR para renderizar la experiencia inmersiva
 */
export default function ARGallery({ artworks }: ARGalleryProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [favLoading, setFavLoading] = useState<boolean>(false);
  const store = createXRStore();

  // Reset favorite flag when selection changes
  useEffect(() => {
    let mounted = true;
    // cuando se selecciona una obra, comprobar si ya está en favoritos
    const checkFavorite = async () => {
      setIsFavorite(false);
      setFavLoading(true);
      if (!selectedArtwork) {
        setFavLoading(false);
        return;
      }
      const user = authService.getCurrentUser();
      if (!user) {
        setFavLoading(false);
        return;
      }
      try {
        const favs = await artworkService.getFavorites(user.id);
        if (!mounted) return;
        const found = favs.some((f) => String(f.id) === String(selectedArtwork.id));
        setIsFavorite(found);
      } catch (err) {
        // en caso de error (incluye 429) no marcar como favorito
        console.debug('Error checking favorites', err);
        if (!mounted) return;
        setIsFavorite(false);
      } finally {
        if (mounted) setFavLoading(false);
      }
    };

    checkFavorite();

    return () => { mounted = false; };
  }, [selectedArtwork]);

  const handleAddFavorite = async () => {
    if (!selectedArtwork || !selectedArtwork.id) return alert('Obra sin identificador');
    const user = authService.getCurrentUser();
    if (!user) {
      // No autenticado, redirigir a login
      window.location.href = '/login';
      return;
    }

    try {
      setFavLoading(true);
      await artworkService.addToFavorites(user.id, selectedArtwork);
      setIsFavorite(true);
      alert('Añadido a favoritos');
    } catch (err: any) {
      console.error('Error añadiendo a favoritos', err);
      alert(err?.response?.data?.message || 'Error al añadir a favoritos');
    } finally {
      setFavLoading(false);
    }
  };

  // Nota: solo se mantiene la acción de 'añadir a favoritos'.

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
        style={{ background: '#f5f0e8' }}
        gl={{ 
          antialias: true,
          alpha: false,
          // Configuración optimizada para Quest 2
          powerPreference: 'high-performance',
        }}
        shadows
      >
        {/* XR: Habilita WebXR (VR/AR) */}
        <XR store={store}>
          {/* Movimiento con joystick - envuelve todo el contenido */}
          <PlayerMovement>
            {/* Iluminación estilo museo */}
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={0.8} 
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[0, 4, 0]} intensity={0.6} distance={15} decay={2} />
            <spotLight 
              position={[5, 5, 5]} 
              angle={0.3} 
              penumbra={0.5} 
              intensity={0.5}
              castShadow
            />
            <spotLight 
              position={[-5, 5, -5]} 
              angle={0.3} 
              penumbra={0.5} 
            intensity={0.5}
            castShadow
            />

            {/* Cámara con perspectiva */}
            <PerspectiveCamera makeDefault position={[0, 1.6, 5]} />

            {/* Galería virtual con las obras de arte */}
            <VirtualGallery 
              artworks={artworks}
              onSelectArtwork={setSelectedArtwork}
            />

            {/* Controles para navegación con mouse (modo no-VR) */}
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              target={[0, 1.6, 0]}
            />
          </PlayerMovement>
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
          <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
            <button
              onClick={handleAddFavorite}
              disabled={favLoading || isFavorite}
              style={{
                padding: '8px 12px',
                backgroundColor: isFavorite ? '#888' : '#ff6b81',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: favLoading || isFavorite ? 'default' : 'pointer',
              }}
            >
              {favLoading ? 'Procesando...' : isFavorite ? 'Añadido' : 'Añadir a favoritos'}
            </button>

            <button
              onClick={() => setSelectedArtwork(null)}
              style={{
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
        </div>
      )}
    </div>
  );
}
