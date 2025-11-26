import api from './api';

export interface Artwork {
  id: string;
  title: string;
  artist?: string;
  museum: string;
  imageUrl?: string;
  primaryImageSmall?: string;
  description?: string;
  culture?: string;
  period?: string;
  dated?: string;
  medium?: string;
  dimensions?: string;
  department?: string;
  classification?: string;
}

export interface SearchParams {
  query: string;
  museums?: string[];
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'title' | 'museum';
  period?: string;
  artist?: string;
}

export interface SearchResponse {
  success: boolean;
  data: {
    artworks: Artwork[];
    total: number;
    museums: string[];
  };
  timestamp: string;
}

class ArtworkService {
  // Simple in-memory cache + cooldowns to avoid spamming the backend when we hit rate limits.
  private favoritesCache: Record<string, Artwork[]> = {};
  private favoritesLastFetch: Record<string, number> = {};
  private favoritesCooldownUntil: Record<string, number> = {};

  // cache TTL in ms (use a small value so UI stays fresh but avoids aggressive refetch)
  private CACHE_TTL = 10 * 1000; // 10s
  
  private normalizeFavorites(raw: any): Artwork[] {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      if (raw.length === 0) return [];
      
      // if items are strings like 'met_438003' map them to minimal Artwork objects (legacy)
      if (typeof raw[0] === 'string') {
        return raw.map((s) => {
          const str = String(s);
          const parts = str.split('_');
          return { id: str, title: str, museum: parts.length > 1 ? parts[0] : 'unknown' } as Artwork;
        });
      }
      
      // if items are favorite objects with artworkId, map to Artwork format
      if (raw[0]?.artworkId) {
        return raw.map((fav) => ({
          id: fav.artworkId,
          title: fav.title || fav.artworkId,
          artist: fav.artist,
          imageUrl: fav.imageUrl,
          museum: fav.museum || 'unknown',
          description: fav.description,
          dated: fav.year,
          primaryImageSmall: fav.imageUrl
        } as Artwork));
      }
      
      // assume already Artwork[]
      return raw as Artwork[];
    }
    return [];
  }
  async searchArtworks(params: SearchParams): Promise<SearchResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('query', params.query);
    
    if (params.museums && params.museums.length > 0) {
      queryParams.append('museums', params.museums.join(','));
    }
    
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    
    if (params.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    
    if (params.period) {
      queryParams.append('period', params.period);
    }
    
    if (params.artist) {
      queryParams.append('artist', params.artist);
    }

    const response = await api.get<SearchResponse>(
      `/api/v1/composition/search?${queryParams.toString()}`
    );
    return response.data;
  }

  async getArtworkDetail(id: string, museum: string): Promise<Artwork> {
    const response = await api.get<{ success: boolean; data: Artwork }>(
      `/api/v1/composition/artworks/${id}?museum=${museum}`
    );
    return response.data.data;
  }

  async addToFavorites(userId: string, artwork: Artwork): Promise<void> {
    // Enviar datos completos de la obra al backend
    await api.post(`/users/${userId}/favorites`, {
      artworkId: artwork.id,
      title: artwork.title,
      artist: artwork.artist,
      imageUrl: artwork.imageUrl || artwork.primaryImageSmall,
      museum: artwork.museum,
      description: artwork.description || artwork.medium,
      year: artwork.dated || artwork.period
    });
    
    // update cache optimistically with full artwork data
    if (!this.favoritesCache[userId]) this.favoritesCache[userId] = [];
    // avoid duplicates
    if (!this.favoritesCache[userId].some(a => a.id === artwork.id)) {
      this.favoritesCache[userId].push(artwork);
    }
    this.favoritesLastFetch[userId] = Date.now();
  }

  async removeFromFavorites(userId: string, artworkId: string): Promise<void> {
    await api.delete(`/users/${userId}/favorites`, { data: { artworkId } });
    // update cache if present
    if (this.favoritesCache[userId]) {
      this.favoritesCache[userId] = this.favoritesCache[userId].filter(a => a.id !== artworkId);
      this.favoritesLastFetch[userId] = Date.now();
    }
  }

  async getFavorites(userId: string): Promise<Artwork[]> {
    // If we're in cooldown for this user, return cached results (if any) to avoid throwing
    const cooldown = this.favoritesCooldownUntil[userId];
    if (cooldown && Date.now() < cooldown) {
      return this.favoritesCache[userId] ?? [];
    }

    // If we have a recent cache, return it immediately and refresh in background
    const last = this.favoritesLastFetch[userId] ?? 0;
    const isFresh = Date.now() - last < this.CACHE_TTL && Array.isArray(this.favoritesCache[userId]);
    if (isFresh) {
      // kick off a background refresh but don't await it
      (async () => {
        try {
          const resp = await api.get(`/users/${userId}/favorites`);
          const data = resp.data;
          let favs: Artwork[] = [];
          if (data?.data && Array.isArray(data.data.favorites)) favs = this.normalizeFavorites(data.data.favorites);
          else if (Array.isArray(data)) favs = this.normalizeFavorites(data);
          else if (Array.isArray(data?.favorites)) favs = this.normalizeFavorites(data.favorites);
          this.favoritesCache[userId] = favs;
          this.favoritesLastFetch[userId] = Date.now();
        } catch (e: any) {
          // if server responds 429, set cooldown
          const status = e?.response?.status;
          if (status === 429) {
            const raStr = e?.response?.headers?.['retry-after'] || e?.response?.data?.retryAfter;
            const raNum = raStr ? parseInt(String(raStr), 10) : NaN;
            const after = Number.isFinite(raNum) ? raNum : 30;
            this.favoritesCooldownUntil[userId] = Date.now() + after * 1000;
          }
        }
      })();
      return this.favoritesCache[userId];
    }

    try {
      const response = await api.get(`/users/${userId}/favorites`, {
        timeout: 10000, // 10 second timeout
      });
      const respData = response.data;
      let favs: Artwork[] = [];
      if (respData?.data && Array.isArray(respData.data.favorites)) {
        favs = this.normalizeFavorites(respData.data.favorites);
      } else if (Array.isArray(respData)) {
        favs = this.normalizeFavorites(respData);
      } else if (Array.isArray(respData?.favorites)) {
        favs = this.normalizeFavorites(respData.favorites);
      }
      // update cache
      this.favoritesCache[userId] = favs;
      this.favoritesLastFetch[userId] = Date.now();
      // clear any existing cooldown
      delete this.favoritesCooldownUntil[userId];
      return favs;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429) {
        const raStr = err?.response?.headers?.['retry-after'] || err?.response?.data?.retryAfter;
        const raNum = raStr ? parseInt(String(raStr), 10) : NaN;
        const after = Number.isFinite(raNum) ? raNum : 30;
        this.favoritesCooldownUntil[userId] = Date.now() + after * 1000;
        // return cached data if available to keep UI populated, otherwise empty array
        return this.favoritesCache[userId] ?? [];
      }
      // rethrow other errors so callers can handle/display them
      throw err;
    }
  }

  // Search history API helpers
  async getSearchHistory(userId: string): Promise<string[]> {
    try {
      const resp = await api.get(`/users/${userId}/search-history`);
      const data = resp.data;
      // Support several shapes: { data: { history: [...] } } | { history: [...] } | [...]
      const raw: any[] = data?.data && Array.isArray(data.data.history)
        ? data.data.history
        : Array.isArray(data)
          ? data
          : Array.isArray(data?.history)
            ? data.history
            : [];

      // Normalize entries: if item is an object prefer common fields like `query`, `term`, `text`
      const normalized = raw.map((item) => {
        if (typeof item === 'string') return item;
        if (!item) return '';
        if (typeof item === 'object') {
          if ('query' in item) return String(item.query);
          if ('term' in item) return String(item.term);
          if ('text' in item) return String(item.text);
          if ('value' in item) return String(item.value);
          // fallback: if object has a nested `query` under data
          if (item.data && typeof item.data === 'object' && 'query' in item.data) return String(item.data.query);
        }
        return String(item);
      });

      return normalized.map((s) => s ?? '').filter((s) => s.length > 0);
      return [];
    } catch (err: any) {
      // if rate limited or other error, return empty history
      return [];
    }
  }

  async addSearchHistory(userId: string, query: string): Promise<void> {
    try {
      await api.post(`/users/${userId}/search-history`, { query });
    } catch (err: any) {
      // ignore errors silently for history writes
    }
  }
}

export default new ArtworkService();
