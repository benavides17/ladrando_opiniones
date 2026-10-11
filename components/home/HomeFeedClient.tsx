'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, PlusCircle, Sparkles, Headphones, Radio, ArrowRight, PawPrint, HeartHandshake, Megaphone } from 'lucide-react';
import type { AudioWithProfile } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { AudioCard } from '@/components/audio/AudioCard';
import { Button } from '@/components/ui/Button';
import { AudioCardSkeleton } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { SAMPLE_AUDIOS } from '@/lib/data/sampleAudios';

const PAGE_SIZE = 6;

const SECTION_CHARACTERS = [
  {
    category: 'animalista',
    title: 'Actividad animalista',
    description: 'Comparte acciones, historias y propuestas para proteger a los animales.',
    image: '/characters/animalista.png',
    icon: PawPrint,
    accent: 'from-purple-500/30 to-cyan-400/20',
  },
  {
    category: 'ayuda',
    title: 'Ayuda',
    description: 'Encuentra apoyo, consejos y personas dispuestas a colaborar.',
    image: '/characters/ayuda.png',
    icon: HeartHandshake,
    accent: 'from-cyan-500/30 to-blue-400/20',
  },
  {
    category: 'denuncias',
    title: 'Reportes por denuncia',
    description: 'Da a conocer situaciones que necesitan atención y respuesta.',
    image: '/characters/denuncias.png',
    icon: Megaphone,
    accent: 'from-teal-500/30 to-purple-400/20',
  },
];

export function HomeFeedClient() {
  const [audios, setAudios] = useState<AudioWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
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
          .order('created_at', { ascending: false })
          .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }

        if (searchTerm.trim()) {
          query = query.ilike('title', `%${searchTerm.trim()}%`);
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
          // Si la base de datos aún no tiene registros o no está configurada,
          // utilizamos los audios muestra para que la comunidad se vea activa y lista
          let demoList = SAMPLE_AUDIOS;
          if (selectedCategory !== 'all') {
            demoList = demoList.filter((a) => a.category === selectedCategory);
          }
          if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            demoList = demoList.filter(
              (a) =>
                a.title.toLowerCase().includes(term) ||
                (a.description && a.description.toLowerCase().includes(term))
            );
          }
          setAudios(demoList);
          setHasMore(false);
        }
      } catch {
        // En caso de que no haya conexión a Supabase aún, mostrar datos muestra
        let demoList = SAMPLE_AUDIOS;
        if (selectedCategory !== 'all') {
          demoList = demoList.filter((a) => a.category === selectedCategory);
        }
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          demoList = demoList.filter((a) =>
            a.title.toLowerCase().includes(term)
          );
        }
        setAudios(demoList);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [supabase, selectedCategory, searchTerm]
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

  const handleSectionSelect = (category: string) => {
    setSelectedCategory(category);
    document.getElementById('audios-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-12">
      {/* Hero Banner con atmósfera azul profunda */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-deepblue-850 via-deepblue-800 to-teal-950/70 border border-deepblue-600/50 p-8 sm:p-14 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-5">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-menta-300/10 text-menta-300 border border-menta-300/30 text-xs font-semibold backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-dorado-300" />
            <span>Comunidad animalista, solidaria y participativa</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Escucha, comparte y conecta a través de la voz.
          </h1>

          <p className="text-petroleo-100 text-sm sm:text-base leading-relaxed">
            Comparte iniciativas animalistas, encuentra ayuda cuando la necesites y realiza reportes por denuncia para dar voz a quienes más lo necesitan.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-3">
            <Link href="/audios/new">
              <Button
                variant="accent"
                size="lg"
                className="shadow-glowGold font-bold text-deepblue-950 px-6"
                leftIcon={<PlusCircle className="w-5 h-5 text-deepblue-950" />}
              >
                Publicar audio ahora
              </Button>
            </Link>

            <Link href="/explorar">
              <Button
                variant="outline"
                size="lg"
                className="text-white border-teal-500/40 hover:bg-teal-500/15"
                leftIcon={<Headphones className="w-5 h-5 text-teal-300" />}
              >
                Explorar catálogo
              </Button>
            </Link>
          </div>
        </div>

        {/* Resplandores ambientales decorativos */}
        <div className="absolute -right-10 -bottom-16 w-96 h-96 rounded-full bg-teal-500/25 blur-3xl pointer-events-none" />
        <div className="absolute right-32 top-0 w-72 h-72 rounded-full bg-dorado-400/15 blur-2xl pointer-events-none" />
      </section>

      {/* Buscador */}
      <section id="audios-section" className="scroll-mt-24 space-y-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-2xl">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-400/80 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar audios por título o tema..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-deepblue-600/70 bg-deepblue-800/80 text-sm text-white placeholder:text-petroleo-300 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all shadow-inner"
            />
          </div>

          <div className="text-xs font-semibold text-teal-300/80 flex items-center space-x-2 self-start md:self-center">
            <Radio className="w-4 h-4 text-teal-400 animate-pulse" />
            <span>Publicaciones en vivo de la comunidad</span>
          </div>
        </div>
      </section>

      {/* Accesos interactivos a las secciones */}
      <section aria-labelledby="section-characters-title" className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Explora por tema</p>
            <h2 id="section-characters-title" className="mt-1 text-2xl font-black text-white">
              Una comunidad con muchas voces
            </h2>
          </div>
          <span className="hidden sm:block text-xs text-petroleo-300">Elige una sección para comenzar</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {SECTION_CHARACTERS.map((section) => {
            const Icon = section.icon;
            return (
              <article
                key={section.category}
                className={`group relative overflow-hidden rounded-3xl border border-deepblue-600/60 bg-gradient-to-br ${section.accent} bg-deepblue-850/90 p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-teal-400/60 hover:shadow-glowTeal`}
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-2xl transition-transform duration-500 group-hover:scale-150" />
                <div className="relative flex items-center gap-4">
                  <img
                    src={section.image}
                    alt=""
                    className="h-24 w-24 rounded-2xl object-cover shadow-lg ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2 text-teal-200">
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Sección</span>
                    </div>
                    <h3 className="text-lg font-extrabold leading-tight text-white">{section.title}</h3>
                  </div>
                </div>
                <p className="relative mt-4 min-h-10 text-sm leading-relaxed text-petroleo-100">{section.description}</p>
                <button
                  type="button"
                  onClick={() => handleSectionSelect(section.category)}
                  className="relative mt-4 inline-flex items-center gap-2 rounded-xl border border-teal-300/30 bg-teal-300/10 px-4 py-2 text-sm font-bold text-teal-100 transition-colors hover:bg-teal-300/20 focus:outline-none focus:ring-2 focus:ring-teal-300/60"
                >
                  Ver audios
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {/* Grid de Audios Recientes */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Audios destacados y recientes
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <AudioCardSkeleton key={i} />
            ))}
          </div>
        ) : audios.length === 0 ? (
          <EmptyState
            icon="mic"
            title="Aún no hay audios en esta sección"
            description="Sé el primero en compartir tu voz o prueba seleccionando otra categoría o término de búsqueda."
            actionHref="/audios/new"
            actionText="Publicar el primer audio"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {audios.map((audio) => (
                <AudioCard key={audio.id} audio={audio} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center pt-8">
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
      </section>
    </div>
  );
}
