import Link from 'next/link';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'Recuperar contraseña — VozComún',
  description: 'Solicita un enlace para restablecer el acceso a tu cuenta de VozComún.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-petroleo-100 shadow-card">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-petroleo-900">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-petroleo-500 mt-1">
            Ingresa tu correo y te enviaremos las instrucciones de recuperación.
          </p>
        </div>

        <ForgotPasswordForm />

        {/* Back link */}
        <div className="mt-6 text-center text-sm pt-6 border-t border-humo-200">
          <Link
            href="/login"
            className="inline-flex items-center space-x-1.5 text-petroleo-600 font-medium hover:text-teal-600 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a iniciar sesión</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

