import React from 'react';
import Link from 'next/link';
import { ArrowLeft, UserCircle } from 'lucide-react';
import { EditProfileForm } from '@/components/profile/EditProfileForm';

export const metadata = {
  title: 'Editar mi perfil — VozComún',
  description: 'Modifica tu información pública en VozComún.',
};

export default function EditProfilePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-sm text-petroleo-500 hover:text-teal-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-petroleo-100 shadow-card space-y-8">
        <div>
          <div className="flex items-center space-x-2 text-teal-600 text-sm font-semibold mb-1">
            <UserCircle className="w-4 h-4" />
            <span>Configuración de cuenta</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-petroleo-900">
            Editar mi perfil
          </h1>
          <p className="text-sm text-petroleo-500 mt-1">
            Personaliza cómo apareces ante la comunidad de VozComún.
          </p>
        </div>

        <EditProfileForm />
      </div>
    </div>
  );
}

