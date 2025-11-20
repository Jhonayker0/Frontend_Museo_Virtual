import type { Artwork } from '../../services/artworkService';
import ArtworkFrame from './ArtworkFrame';
import { Text } from '@react-three/drei';

interface VirtualGalleryProps {
  artworks: Artwork[];
  onSelectArtwork: (artwork: Artwork) => void;
}

/**
 * Componente que organiza las obras de arte en una galería virtual 3D
 * Distribuye los cuadros en paredes formando salas
 */
export default function VirtualGallery({ artworks, onSelectArtwork }: VirtualGalleryProps) {
  // Configuración de la galería
  const artworksPerWall = 6;
  const wallSpacing = 6; // Espaciado entre paredes
  const frameSpacing = 2.2; // Espaciado entre cuadros
  const frameHeight = 1.6; // Altura de los cuadros desde el suelo

  /**
   * Calcula la posición de cada obra en la galería
   * Distribuye en múltiples paredes formando una U
   */
  const getArtworkPosition = (index: number): { position: [number, number, number]; rotation: [number, number, number] } => {
    const wallIndex = Math.floor(index / artworksPerWall);
    const positionInWall = index % artworksPerWall;
    
    // Distribuir en 4 paredes (frente, derecha, izquierda, atrás)
    switch (wallIndex % 4) {
      case 0: // Pared frontal
        return {
          position: [
            (positionInWall - artworksPerWall / 2 + 0.5) * frameSpacing,
            frameHeight,
            -wallSpacing
          ],
          rotation: [0, 0, 0]
        };
      case 1: // Pared derecha
        return {
          position: [
            wallSpacing,
            frameHeight,
            (positionInWall - artworksPerWall / 2 + 0.5) * frameSpacing
          ],
          rotation: [0, -Math.PI / 2, 0]
        };
      case 2: // Pared izquierda
        return {
          position: [
            -wallSpacing,
            frameHeight,
            (positionInWall - artworksPerWall / 2 + 0.5) * frameSpacing
          ],
          rotation: [0, Math.PI / 2, 0]
        };
      case 3: // Pared trasera
        return {
          position: [
            (positionInWall - artworksPerWall / 2 + 0.5) * frameSpacing,
            frameHeight,
            wallSpacing
          ],
          rotation: [0, Math.PI, 0]
        };
      default:
        return {
          position: [0, frameHeight, -wallSpacing],
          rotation: [0, 0, 0]
        };
    }
  };

  return (
    <group>
      {/* Título de la galería flotante */}
      <Text
        position={[0, 3, -5.5]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Museo Virtual AR
      </Text>

      <Text
        position={[0, 2.5, -5.5]}
        fontSize={0.12}
        color="#aaaaaa"
        anchorX="center"
        anchorY="middle"
      >
        {artworks.length} obras de arte
      </Text>

      {/* Suelo de la galería */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Grid del suelo para mejor orientación espacial */}
      <gridHelper args={[30, 30, '#333333', '#222222']} position={[0, 0.01, 0]} />

      {/* Renderizar cada obra de arte */}
      {artworks.map((artwork, index) => {
        const { position, rotation } = getArtworkPosition(index);
        // Crear una key única combinando museo, id e índice
        const uniqueKey = `${artwork.museum}_${artwork.id || 'no-id'}_${index}`;
        return (
          <ArtworkFrame
            key={uniqueKey}
            artwork={artwork}
            position={position}
            rotation={rotation}
            onSelect={onSelectArtwork}
          />
        );
      })}

      {/* Paredes invisibles con colisión (opcional) */}
      {/* Estas paredes ayudan a definir el espacio pero no son visibles */}
      <mesh position={[0, 2, -wallSpacing - 0.1]} visible={false}>
        <boxGeometry args={[wallSpacing * 2, 4, 0.2]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      
      <mesh position={[wallSpacing + 0.1, 2, 0]} rotation={[0, Math.PI / 2, 0]} visible={false}>
        <boxGeometry args={[wallSpacing * 2, 4, 0.2]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      
      <mesh position={[-wallSpacing - 0.1, 2, 0]} rotation={[0, Math.PI / 2, 0]} visible={false}>
        <boxGeometry args={[wallSpacing * 2, 4, 0.2]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}
