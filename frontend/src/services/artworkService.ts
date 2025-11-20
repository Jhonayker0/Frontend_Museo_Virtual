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

  async addToFavorites(userId: string, artworkId: string): Promise<void> {
    await api.post(`/users/${userId}/favorites`, { artworkId });
  }

  async removeFromFavorites(userId: string, artworkId: string): Promise<void> {
    await api.delete(`/users/${userId}/favorites`, { data: { artworkId } });
  }
}

export default new ArtworkService();
