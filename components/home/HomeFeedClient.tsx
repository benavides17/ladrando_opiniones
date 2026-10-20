'use client';

import React from 'react';
import Link from 'next/link';
import { PlusCircle, Sparkles, Headphones, ArrowRight, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function HomeFeedClient() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Banner con atmósfera azul profunda */}
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-deepblue-600/60 bg-gradient-to-br from-deepblue-850 via-deepblue-800 to-teal-950/70 p-7 shadow-2xl sm:p-12 lg:p-16">
        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-menta-300/30 bg-menta-300/10 px-3.5 py-1.5 text-xs font-semibold text-menta-300 backdrop-blur-md shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-dorado-300" />
            <span>Comunidad animalista, solidaria y participativa</span>
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Escucha, comparte y conecta a través de la voz.
            </h1>

            <p className="max-w-2xl text-sm leading-7 text-petroleo-100 sm:text-base">
              Comparte iniciativas animalistas, encuentra ayuda cuando la necesites y realiza reportes por denuncia para dar voz a quienes más lo necesitan.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/audios/new">
                <Button
                  variant="accent"
                  size="lg"
                  className="px-6 font-bold text-deepblue-950 shadow-glowGold"
                  leftIcon={<PlusCircle className="h-5 w-5 text-deepblue-950" />}
                >
                  Publicar audio ahora
                </Button>
              </Link>

              <Link href="/explorar">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-teal-500/40 text-white hover:bg-teal-500/15"
                  leftIcon={<Headphones className="h-5 w-5 text-teal-300" />}
                >
                  Explorar catálogo
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative hidden h-52 items-center justify-center lg:flex">
            <div className="absolute h-44 w-44 rounded-full border border-teal-300/20 bg-teal-300/5 shadow-[0_0_80px_rgba(45,212,191,0.18)]" />
            <div className="absolute h-32 w-32 rounded-full border border-dorado-300/20 bg-dorado-300/5" />
            <Headphones className="relative h-16 w-16 text-teal-200/80" strokeWidth={1.2} />
          </div>
        </div>

        {/* Resplandores ambientales decorativos */}
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-teal-500/25 blur-3xl" />
        <div className="pointer-events-none absolute right-32 top-0 h-72 w-72 rounded-full bg-dorado-400/15 blur-2xl" />
      </section>

      <section className="mx-auto w-full max-w-2xl">
        <article className="group relative overflow-hidden rounded-[2rem] border border-teal-400/25 bg-gradient-to-br from-cyan-500/25 via-blue-400/15 to-deepblue-850/95 p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-teal-400/60 hover:shadow-glowTeal sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/5 blur-2xl transition-transform duration-500 group-hover:scale-150" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <img
              src="/characters/ayuda.png"
              alt=""
              className="h-28 w-28 rounded-3xl object-cover shadow-lg ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-200">
                <HeartHandshake className="h-4 w-4" />
                <span>Sección</span>
              </div>
              <h2 className="text-2xl font-extrabold leading-tight text-white">¿Quién tiene la voz?</h2>
            </div>
          </div>
          <p className="relative mt-6 max-w-xl text-sm leading-7 text-petroleo-100 sm:text-base">
            Un espacio para compartir perspectivas y repensar la forma en que convivimos con los perros.
          </p>
          <Link
            href="/explorar?category=ayuda"
            className="relative mt-6 inline-flex items-center gap-2 rounded-xl border border-teal-300/30 bg-teal-300/10 px-5 py-2.5 text-sm font-bold text-teal-100 transition-colors hover:bg-teal-300/20 focus:outline-none focus:ring-2 focus:ring-teal-300/60"
          >
            Ver audios
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </article>
      </section>

    </div>
  );
}
