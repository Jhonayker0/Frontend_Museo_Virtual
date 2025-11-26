import { useEffect, useState } from 'react';
import artworkService, { Artwork } from '../../services/artworkService';
import authService from '../../services/authService';

interface FavoritesProps {
  onOpenInGallery: (items: Artwork[]) => void;
  onBack: () => void;
}

export default function Favorites({ onOpenInGallery, onBack }: FavoritesProps) {
  const [items, setItems] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<string[]>([]);
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    let mounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const fetchFavorites = async () => {
      // Si estamos en cooldown por rate limit, no volver a pedir
      if (cooldownUntil && Date.now() < cooldownUntil) return;
      setLoading(true);
      setRateLimited(false);
      setRetryAfter(null);
      setErrorMsg(null);

      // Timeout de seguridad: si la petición tarda más de 15 segundos, mostrar error
      timeoutId = setTimeout(() => {
        if (mounted) {
          setLoading(false);
          setErrorMsg('La petición está tardando demasiado. Por favor, verifica tu conexión o intenta más tarde.');
        }
      }, 15000);

      try {
        const res = await artworkService.getFavorites(user.id);
        if (timeoutId) clearTimeout(timeoutId);
        if (!mounted) return;
        setItems(res || []);
      } catch (err: any) {
        if (timeoutId) clearTimeout(timeoutId);
        console.debug('Error cargando favoritos (tratado)', err);
        const status = err?.response?.status;
        if (status === 429) {
          setRateLimited(true);
          const raStr = err?.response?.headers?.['retry-after'] || err?.response?.data?.retryAfter;
          const raNum = raStr ? parseInt(String(raStr), 10) : NaN;
          const after = Number.isFinite(raNum) ? raNum : 30; // fallback 30s
          setRetryAfter(after);
          const until = Date.now() + after * 1000;
          setCooldownUntil(until);
        } else {
          // mostrar mensaje amigable en UI en lugar de alert
          setErrorMsg(err?.response?.data?.message || 'Error cargando favoritos');
        }
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        if (mounted) setLoading(false);
      }
    };

    fetchFavorites();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user, cooldownUntil]);

  // Cuando se establece un cooldown, programar su fin y reintento automático
  useEffect(() => {
    if (!cooldownUntil) return;
    const delay = Math.max(0, cooldownUntil - Date.now());
    const t = setTimeout(() => {
      setCooldownUntil(null);
      setRateLimited(false);
      setRetryAfter(null);
      // Al limpiar cooldownUntil el primer useEffect volverá a dispararse y hará fetch
    }, delay);
    return () => clearTimeout(t);
  }, [cooldownUntil]);

  // helper para reintentar manualmente
  const handleRetry = () => {
    setRateLimited(false);
    setRetryAfter(null);
    setCooldownUntil(null);
    // forzar re-fetch
    artworkService.getFavorites(user!.id)
      .then((res) => setItems(res || []))
      .catch((err: any) => {
        console.debug('Retry error (tratado)', err);
        if (err?.response?.status === 429) {
          setRateLimited(true);
          const raStr = err?.response?.headers?.['retry-after'] || err?.response?.data?.retryAfter;
          const raNum = raStr ? parseInt(String(raStr), 10) : NaN;
          const after = Number.isFinite(raNum) ? raNum : 30;
          setRetryAfter(after);
          setCooldownUntil(Date.now() + after * 1000);
          setErrorMsg('Has alcanzado el límite de peticiones al servidor (Too Many Requests).');
        } else {
          setErrorMsg(err?.response?.data?.message || 'Error cargando favoritos');
        }
      });
  };

  const handleRemove = async (artworkId: string) => {
    if (!user) return;
    if (!artworkId) {
      // protección: no proceder si id inválida
      setErrorMsg('ID de obra inválida');
      return;
    }
    // optimista: quitar de la lista inmediatamente (usar snapshot para revertir si falla)
    const snapshot = items;
    console.debug('handleRemove start', { artworkId, snapshot });
    setRemovingIds((s) => [...s, artworkId]);
    // filtrar sólo el elemento cuyo id coincide (mantener elementos sin id)
    setItems((prev) => {
      const next = prev.filter((it) => String(it.id ?? '') !== String(artworkId));
      console.debug('handleRemove next', { next });
      return next;
    });
    try {
      await artworkService.removeFromFavorites(user.id, artworkId);
      // éxito: cache del servicio ya actualiza
    } catch (err: any) {
      console.debug('Error removing favorite (tratado)', err);
      setErrorMsg(err?.response?.data?.message || 'Error al eliminar favorito');
      // revertir optimista
      setItems(snapshot);
    } finally {
      setRemovingIds((s) => s.filter((id) => id !== artworkId));
    }
  };

  const remainingSeconds = cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000)) : null;

  return (
    <div style={{ padding: 20 }}>
      <h2>Tus favoritos</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={onBack} style={{ marginRight: 8 }}>Volver</button>
        <button onClick={() => onOpenInGallery(items)} disabled={items.length === 0}>Abrir en galería</button>
      </div>

      {rateLimited ? (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: '#f1c40f' }}>Has alcanzado el límite de peticiones al servidor (Too Many Requests).</p>
          {remainingSeconds && remainingSeconds > 0 ? (
            <p>Espera {remainingSeconds} segundos antes de reintentar.</p>
          ) : null}
          <button onClick={handleRetry} disabled={remainingSeconds !== null && remainingSeconds > 0}>
            {remainingSeconds && remainingSeconds > 0 ? `Reintentar (${remainingSeconds}s)` : 'Reintentar ahora'}
          </button>
        </div>
      ) : loading ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <>
          {errorMsg ? <p style={{ color: 'salmon' }}>{errorMsg}</p> : <p>No tienes favoritos aún.</p>}
        </>
      ) : (
        <ul>
          {items.map((a, idx) => {
            // soportar dos formatos: Artwork object o string con formato 'museum_id' o solo id
            const isString = typeof a === 'string';
            const artId = isString ? a : (a?.id ?? '');
            const museumPart = isString ? (String(a).split('_')[0] ?? 'unknownMuseum') : (a?.museum ?? 'unknownMuseum');
            const titleText = isString ? String(a) : (a?.title ?? (a?.id ?? `Obra ${idx + 1}`));
            const artistText = isString ? '' : (a?.artist ?? '');
            const listKey = `${museumPart}_${artId || titleText}_${idx}`;

            return (
              <li key={listKey} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong>{titleText}</strong>{artistText ? ` — ${artistText}` : ''}
                </div>
                <div>
                  <button
                    onClick={() => handleRemove(artId)}
                    disabled={!artId || removingIds.includes(artId)}
                    style={{ marginLeft: 12 }}
                  >
                    {removingIds.includes(artId ?? '') ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
