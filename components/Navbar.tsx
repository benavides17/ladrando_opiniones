'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Radio, PlusCircle, User, LogOut, Compass, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from './ui/Button';
import { getInitials } from '@/lib/utils/formatters';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isLoading, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Inicio', icon: Radio },
    { href: '/explorar', label: 'Explorar', icon: Compass },
  ];

  const username = profile?.username || user?.user_metadata?.username || 'usuario';
  const displayName = profile?.display_name || profile?.username || 'Mi Cuenta';

  return (
    <header className="sticky top-0 z-40 w-full bg-deepblue-950/85 backdrop-blur-xl border-b border-deepblue-600/40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <img
            src="/branding/ladrando-opiniones-icon.png"
            alt="Icono de ladrando opiniones"
            className="h-11 w-11 rounded-full object-cover object-center group-hover:scale-105 transition-transform"
          />
          <span className="font-extrabold text-xl tracking-tight text-white leading-none">
            ladrando <span className="text-menta-300">opiniones</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'text-menta-300 bg-deepblue-750/90 border border-teal-500/30 shadow-sm'
                    : 'text-petroleo-200 hover:text-white hover:bg-deepblue-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons & Auth state */}
        <div className="hidden md:flex items-center space-x-3">
          {/* CTA Publicar Audio */}
          <Link href="/audios/new">
            <Button
              variant="accent"
              size="sm"
              className="shadow-glowGold font-bold text-deepblue-950"
              leftIcon={<PlusCircle className="w-4 h-4 text-deepblue-950" />}
            >
              Publicar audio
            </Button>
          </Link>

          {/* User state */}
          {!isLoading && (
            <>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2.5 p-1.5 px-2 rounded-2xl hover:bg-deepblue-800/80 border border-transparent hover:border-deepblue-600/50 transition-all focus:outline-none"
                    aria-label="Menú de usuario"
                  >
                    <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-menta-300/60 shadow-sm">
                      {getInitials(displayName)}
                    </div>
                    <span className="text-sm font-semibold text-white max-w-[120px] truncate">
                      {displayName}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 bg-deepblue-850/95 backdrop-blur-2xl rounded-2xl shadow-card border border-deepblue-600/60 py-2 z-50 animate-fadeIn"
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-deepblue-700/60">
                        <p className="text-[11px] text-teal-300/70">Conectado como</p>
                        <p className="text-sm font-bold text-white truncate">
                          @{username}
                        </p>
                      </div>

                      <Link
                        href={`/perfil/${username}`}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-petroleo-100 hover:bg-deepblue-750 hover:text-menta-300 transition-colors"
                      >
                        <User className="w-4 h-4 text-teal-400" />
                        <span>Ver mi perfil</span>
                      </Link>

                      <Link
                        href="/mi-perfil"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-petroleo-100 hover:bg-deepblue-750 hover:text-menta-300 transition-colors"
                      >
                        <User className="w-4 h-4 text-teal-400" />
                        <span>Editar mi perfil</span>
                      </Link>

                      <div className="pt-1 mt-1 border-t border-deepblue-700/60">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-2.5 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Cerrar sesión</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-petroleo-200 hover:text-white hover:bg-deepblue-800"
                    >
                      Iniciar sesión
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">
                      Registrarse
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center space-x-2">
          <Link href="/audios/new">
            <Button variant="accent" size="sm" className="font-bold">
              <PlusCircle className="w-4 h-4" />
            </Button>
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl text-petroleo-200 hover:bg-deepblue-800"
            aria-label="Abrir menú móvil"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-deepblue-600/40 bg-deepblue-900/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    pathname === link.href
                      ? 'text-menta-300 bg-deepblue-750 border border-teal-500/30'
                      : 'text-petroleo-200 hover:bg-deepblue-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-deepblue-700/60 space-y-2">
            {user ? (
              <>
                <Link
                  href={`/perfil/${username}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-white"
                >
                  Mi perfil (@{username})
                </Link>
                <Link
                  href="/mi-perfil"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-petroleo-300"
                >
                  Editar mi perfil
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full text-white border-deepblue-500">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
