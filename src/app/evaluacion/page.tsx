'use client'

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import EvaluacionImpacto from '../../components/evaluacion-impacto-mejorada';

function EvaluacionContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return <EvaluacionImpacto initialEmail={email || undefined} />;
}

function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="mt-4 text-lg font-semibold text-gray-700">Cargando...</p>
      </div>
    </div>
  );
}

export default function EvaluacionPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <EvaluacionContent />
    </Suspense>
  );
}