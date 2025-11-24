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
          color="#f0ece2" 
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Grid del suelo sutil */}
      <gridHelper args={[30, 30, '#e0d9cc', '#ebe6d9']} position={[0, 0.01, 0]} />

      {/* Paredes con colores pastel - Alejadas de los marcos */}
      {/* Pared frontal - Azul pastel claro */}
      <mesh position={[0, 2.5, -8]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#e3f2fd" roughness={0.7} />
      </mesh>
      
      {/* Pared derecha - Beige pastel */}
      <mesh position={[8, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.7} />
      </mesh>
      
      {/* Pared izquierda - Beige pastel */}
      <mesh position={[-8, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#f5f5dc" roughness={0.7} />
      </mesh>
      
      {/* Pared trasera - Azul pastel claro */}
      <mesh position={[0, 2.5, 8]} receiveShadow>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#e3f2fd" roughness={0.7} />
      </mesh>

      {/* Techo - Crema claro */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#fffef7" roughness={0.8} />
      </mesh>

      {/* Renderizar obras de arte */}
      {artworks.map((artwork, index) => {
        const { position, rotation } = getArtworkPosition(index);
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

      {/* Bancos para observar las obras */}
      <mesh position={[0, 0.25, 2]} castShadow>
        <boxGeometry args={[2, 0.5, 0.8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.7} />
      </mesh>
    </group>
  );
}

