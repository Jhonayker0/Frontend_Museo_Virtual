import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, RoundedBox, useTexture } from '@react-three/drei';
import type { Artwork } from '../../services/artworkService';

interface ArtworkFrameProps {
  artwork: Artwork;
  position: [number, number, number];
  rotation?: [number, number, number];
  onSelect: (artwork: Artwork) => void;
}

/**
 * Componente que representa un cuadro individual en la galería virtual
 * Muestra la imagen de la obra de arte en un marco 3D con información
 */
export default function ArtworkFrame({ 
  artwork, 
  position, 
  rotation = [0, 0, 0],
  onSelect 
}: ArtworkFrameProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  // Obtener URL de imagen real
  const realImageUrl = artwork.imageUrl || artwork.primaryImageSmall;
  const hasRealImage = realImageUrl && realImageUrl.trim() !== '';
  
  let imageUrl: string;
  
  if (hasRealImage) {
    if (artwork.museum === 'harvard') {
      // Harvard: las URLs ya vienen convertidas a IIIF desde el backend, usar directamente
      imageUrl = realImageUrl;
    } else {
      // MET: usar proxy CORS para imagen real
      imageUrl = `https://corsproxy.io/?${encodeURIComponent(realImageUrl)}`;
    }
  } else {
    // Sin imagen: placeholder con colores suaves
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DFE6E9'];
    const colorIndex = Math.abs(artwork.id?.toString().charCodeAt(0) || 0) % colors.length;
    const color = colors[colorIndex];
    imageUrl = `https://placehold.co/800x1000/${color}/white?text=${encodeURIComponent(artwork.title.slice(0, 25))}`;
  }
  
  // Cargar textura
  const texture = useTexture(imageUrl);

  // Animación de hover
  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered ? 1.05 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  const handleClick = () => {
    onSelect(artwork);
  };

  return (
    <group ref={meshRef} position={position} rotation={rotation}>
      {/* Marco del cuadro */}
      <RoundedBox
        args={[1.4, 1.8, 0.1]}
        radius={0.02}
        position={[0, 0, -0.05]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={handleClick}
      >
        <meshStandardMaterial color="#2a2a2a" />
      </RoundedBox>

      {/* Imagen de la obra */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.2, 1.6]} />
        <meshBasicMaterial 
          map={texture} 
          toneMapped={false}
        />
      </mesh>

      {/* Placa con el título */}
      <RoundedBox
        args={[1.2, 0.15, 0.02]}
        radius={0.01}
        position={[0, -1.0, 0.05]}
      >
        <meshStandardMaterial color="#1a1a1a" />
      </RoundedBox>

      {/* Texto del título */}
      <Text
        position={[0, -1.0, 0.07]}
        fontSize={0.06}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.1}
        textAlign="center"
      >
        {artwork.title.length > 40 
          ? artwork.title.substring(0, 40) + '...' 
          : artwork.title}
      </Text>

      {/* Nombre del artista (si existe) */}
      {artwork.artist && (
        <Text
          position={[0, -1.15, 0.07]}
          fontSize={0.04}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
          maxWidth={1.1}
          textAlign="center"
        >
          {artwork.artist}
        </Text>
      )}

      {/* Luz focal para resaltar el cuadro cuando está en hover */}
      {hovered && (
        <spotLight
          position={[0, 2, 1]}
          angle={0.3}
          penumbra={0.5}
          intensity={2}
          castShadow
        />
      )}
    </group>
  );
}
