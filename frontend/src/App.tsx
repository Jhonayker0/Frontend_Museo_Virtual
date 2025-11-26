import { useState, useEffect } from 'react';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import SearchBar from './components/Search/SearchBar';
import ARGallery from './components/AR/ARGallery';
import authService from './services/authService';
import type { Artwork } from './services/artworkService';
import Favorites from './components/Favorites/Favorites'; // Importing Favorites component
import './App.css';

type AuthView = 'login' | 'register' | 'gallery';

function App() {
  const [authView, setAuthView] = useState<AuthView>('login');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [user, setUser] = useState(authService.getCurrentUser());
  const [view, setView] = useState<AuthView>('gallery');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Verificar si el usuario está autenticado al cargar
    if (authService.isAuthenticated()) {
      setAuthView('gallery');
      setUser(authService.getCurrentUser());
    }
  }, []);

  const handleLoginSuccess = () => {
    setUser(authService.getCurrentUser());
    setAuthView('gallery');
  };

  const handleRegisterSuccess = () => {
    setUser(authService.getCurrentUser());
    setAuthView('gallery');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setAuthView('login');
    setArtworks([]);
  };

  const handleSearch = (results: Artwork[], searched: boolean = false) => {
    setArtworks(results);
    setHasSearched(searched);
  };

  // Handling favorites view
  // Vista de Login
  if (authView === 'login') {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setAuthView('register')}
      />
    );
  }

  // Vista de Registro
  if (authView === 'register') {
    return (
      <Register
        onRegisterSuccess={handleRegisterSuccess}
        onSwitchToLogin={() => setAuthView('login')}
      />
    );
  }

  // Vista principal: Galería
  return (
    <div className="app">
      {/* Header con info del usuario */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">🎨 Museo Virtual AR</h1>
          <div className="user-info">
            <span className="username">👤 {user?.name}</span>
            <button onClick={() => setAuthView('favorites')} className="favorites-button">
              Favoritos
            </button>
            <button onClick={handleLogout} className="logout-button">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Barra de búsqueda */}
      <SearchBar onSearch={handleSearch} />

      {/* Contenido principal: Galería o Favoritos */}
      {authView === 'gallery' && (
        artworks.length > 0 ? (
          <ARGallery artworks={artworks} />
        ) : hasSearched ? (
          <div className="empty-state">
            <div className="empty-content">
              <h2>😔 No se encontraron obras</h2>
              <p>No se encontraron resultados para tu búsqueda</p>
              <p className="empty-hint">
                Intenta con otros términos como: "monet", "picasso", "renaissance", "portrait"
              </p>
              <div className="search-tips">
                <h3>💡 Sugerencias:</h3>
                <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                  <li>Usa términos en inglés para mejores resultados</li>
                  <li>Prueba con nombres de artistas famosos</li>
                  <li>Busca por períodos artísticos (renaissance, baroque, impressionist)</li>
                  <li>Intenta con estilos o temas (portrait, landscape, still life)</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-content">
              <h2>🔍 Busca obras de arte</h2>
              <p>Utiliza la barra de búsqueda para encontrar obras de museos famosos</p>
              <p className="empty-hint">
                Prueba buscar: "monet", "picasso", "renaissance", "impressionist"
              </p>
              <div className="features">
                <div className="feature">
                  <span className="feature-icon">🥽</span>
                  <h3>Realidad Virtual</h3>
                  <p>Usa tus Meta Quest 2 para explorar en VR</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">🖼️</span>
                  <h3>Múltiples Museos</h3>
                  <p>Obras del MET y Harvard Art Museums</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">🎯</span>
                  <h3>Interactivo</h3>
                  <p>Haz clic en las obras para ver detalles</p>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {authView === 'favorites' && (
        <Favorites
          onBack={() => setAuthView('gallery')}
          onOpenInGallery={(items) => { setArtworks(items); setAuthView('gallery'); }}
        />
      )}

      {authView !== 'gallery' && authView !== 'favorites' && (
        <div className="empty-state">
          <div className="empty-content">
            <h2>🔍 Busca obras de arte</h2>
            <p>Utiliza la barra de búsqueda para encontrar obras de museos famosos</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
