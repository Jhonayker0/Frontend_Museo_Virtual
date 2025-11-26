import { useState, useEffect } from 'react';
import artworkService, { type SearchParams, type Artwork } from '../../services/artworkService';
import './Search.css';
import authService from '../../services/authService';

interface SearchBarProps {
  onSearch: (artworks: Artwork[], hasSearched?: boolean) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [museums, setMuseums] = useState<string[]>(['met', 'harvard']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  // load search history on mount if logged in
  useEffect(() => {
    (async () => {
      const user = authService.getCurrentUser();
      if (!user) return;
      const h = await artworkService.getSearchHistory(user.id);
      setHistory(h.slice(0, 10));
    })();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Por favor ingresa un término de búsqueda');
      return;
    }

    if (museums.length === 0) {
      setError('Por favor selecciona al menos un museo');
      return;
    }

    setError('');
    setLoading(true);
    
    // Limpiar resultados anteriores inmediatamente
    onSearch([], false);

    try {
      const params: SearchParams = {
        query: query.trim(),
        museums: museums.length > 0 ? museums : undefined,
        limit: 12,
        sortBy: 'relevance'
      };

      console.log('Buscando con parámetros:', params);
      
      // Buscar primero en MET, luego en Harvard para priorizar obras con imágenes
      let allArtworks: Artwork[] = [];
      
      if (museums.includes('met')) {
        const metParams = { ...params, museums: ['met'], limit: 8 };
        const metResponse = await artworkService.searchArtworks(metParams);
        allArtworks.push(...metResponse.data.artworks);
      }
      
      if (museums.includes('harvard')) {
        const remaining = params.limit ? params.limit - allArtworks.length : 4;
        if (remaining > 0) {
          const harvardParams = { ...params, museums: ['harvard'], limit: remaining };
          const harvardResponse = await artworkService.searchArtworks(harvardParams);
          allArtworks.push(...harvardResponse.data.artworks);
        }
      }
      
      console.log(`Total: ${allArtworks.length} obras (MET primero)`);

      // Notificar resultados con flag de búsqueda realizada
      onSearch(allArtworks, true);

      // persist search in history (best-effort)
      try {
        const user = authService.getCurrentUser();
        if (user) await artworkService.addSearchHistory(user.id, params.query);
        // refresh local history
        const h = await artworkService.getSearchHistory(user!.id);
        setHistory(h.slice(0, 10));
      } catch {
        // ignore history errors
      }
    } catch (err: any) {
      console.error('Error completo:', err);
      console.error('Respuesta del error:', err.response);
      const errorMessage = err.response?.data?.message 
        || err.message 
        || 'Error al buscar obras de arte. Verifica que el backend esté corriendo.';
      setError(errorMessage);
      onSearch([], false);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = async (q: string) => {
    setQuery(q);
    // trigger search programmatically
    // create a fake event
    const fake = { preventDefault: () => {} } as unknown as React.FormEvent;
    await handleSearch(fake);
  };

  const toggleMuseum = (museum: string) => {
    setMuseums(prev => 
      prev.includes(museum) 
        ? prev.filter(m => m !== museum)
        : [...prev, museum]
    );
  };

  return (
    <div className="search-container">
      {history.length > 0 && (
        <div className="search-history">
          <strong>Historial:</strong>
          <ul>
            {history.map((h, i) => (
              <li key={`hist_${i}`}>
                <button className="history-item" onClick={() => handleHistoryClick(h)}>{h}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar obras de arte (ej: monet, picasso, renaissance)..."
            className="search-input"
            disabled={loading}
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? '🔄' : '🔍'} {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        <div className="museum-filters">
          <span className="filter-label">Museos:</span>
          <label className="museum-checkbox">
            <input
              type="checkbox"
              checked={museums.includes('met')}
              onChange={() => toggleMuseum('met')}
              disabled={loading}
            />
            MET (Metropolitan)
          </label>
          <label className="museum-checkbox">
            <input
              type="checkbox"
              checked={museums.includes('harvard')}
              onChange={() => toggleMuseum('harvard')}
              disabled={loading}
            />
            Harvard Art Museums
          </label>
        </div>

        {error && <div className="search-error">{error}</div>}
      </form>
    </div>
  );
}
