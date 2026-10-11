'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Compass, ArrowUpDown } from 'lucide-react';
import type { AudioWithProfile } from '@/types/database';
import { AUDIO_CATEGORIES } from '@/lib/validations/audio';
import { createClient } from '@/lib/supabase/client';
import { AudioCard } from '@/components/audio/AudioCard';
import { Button } from '@/components/ui/Button';
import { AudioCardSkeleton } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { SAMPLE_AUDIOS } from '@/lib/data/sampleAudios';

const PAGE_SIZE = 9;

export function ExploreClient() {
  const [audios, setAudios] = useState<AudioWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const supabase = createClient();

  const fetchAudios = useCallback(
    async (pageNum: number, isInitial: boolean = false) => {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        let query = supabase
          .from('audios')
          .select(`
            *,
            profile:profiles (
              id,
              username,
              display_name,
              avatar_path
            )
          `, { count: 'exact' })
          .eq('status', 'published')
          .order('created_at', { ascending: sortOrder === 'desc' ? false : true })
          .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }

        if (searchQuery.trim()) {
          query = query.or(`title.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`);
        }

        const { data, count, error } = await query;

        if (!error && data && data.length > 0) {
          const list = data as unknown as AudioWithProfile[];
          if (pageNum === 0) {
            setAudios(list);
          } else {
            setAudios((prev) => [...prev, ...list]);
          }

          const total = count || 0;
          setHasMore((pageNum + 1) * PAGE_SIZE < total);
        } else {
          // Fallback a los audios muestra
          let demoList = [...SAMPLE_AUDIOS];
          if (selectedCategory !== 'all') {
            demoList = demoList.filter((a) => a.category === selectedCategory);
          }
          if (searchQuery.trim()) {
            const term = searchQuery.toLowerCase();
            demoList = demoList.filter(
              (a) =>
                a.title.toLowerCase().includes(term) ||
                (a.description && a.description.toLowerCase().includes(term))
            );
          }
          if (sortOrder === 'asc') {
            demoList.reverse();
          }
          setAudios(demoList);
          setHasMore(false);
        }
      } catch {
        let demoList = [...SAMPLE_AUDIOS];
        if (selectedCategory !== 'all') {
          demoList = demoList.filter((a) => a.category === selectedCategory);
        }
        if (searchQuery.trim()) {
          const term = searchQuery.toLowerCase();
          demoList = demoList.filter(
            (a) =>
              a.title.toLowerCase().includes(term) ||
              (a.description && a.description.toLowerCase().includes(term))
          );
        }
        setAudios(demoList);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [supabase, selectedCategory, searchQuery, sortOrder]
  );

  useEffect(() => {
    setPage(0);
    fetchAudios(0, true);
  }, [fetchAudios]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAudios(nextPage, false);
  };

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <div className="flex items-center space-x-2 text-teal-400 text-sm font-semibold mb-1">
          <Compass className="w-4 h-4" />
          <span>Explorar comunidad</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Catálogo de audios
        </h1>
        <p className="text-sm sm:text-base text-petroleo-200 mt-1 max-w-xl">
          Descubre grabaciones de audio publicadas por creadores y miembros de toda la comunidad.
        </p>
      </div>

      {/* Controles de Búsqueda, Filtro y Orden */}
      <div className="bg-deepblue-800/60 rounded-3xl p-5 sm:p-6 border border-deepblue-600/50 shadow-card backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-400/80 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-deepblue-600/70 bg-deepblue-900/90 text-sm text-white placeholder:text-petroleo-300 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all shadow-inner"
            />
          </div>

          {/* Orden */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl border border-deepblue-600/60 bg-deepblue-750 hover:bg-deepblue-700 text-xs font-bold text-petroleo-100 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-teal-400" />
            <span>
              {sortOrder === 'desc' ? 'Más recientes' : 'Más antiguos'}
            </span>
          </button>
        </div>

        {/* Secciones */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-glowTeal'
                : 'bg-deepblue-750/70 text-petroleo-200 hover:text-white hover:bg-deepblue-700/80 border border-deepblue-600/40'
            }`}
          >
            Todas
          </button>

          {AUDIO_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat.value
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-glowTeal'
                  : 'bg-deepblue-750/70 text-petroleo-200 hover:text-white hover:bg-deepblue-700/80 border border-deepblue-600/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resultados */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <AudioCardSkeleton key={i} />
          ))}
        </div>
      ) : audios.length === 0 ? (
        <EmptyState
          icon="headphones"
          title="No se encontraron publicaciones"
          description="Intenta buscar con otros términos o elige otra categoría para encontrar más audios."
          actionHref="/audios/new"
          actionText="Publicar un audio"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audios.map((audio) => (
              <AudioCard key={audio.id} audio={audio} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                isLoading={isLoadingMore}
              >
                Cargar más audios
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
