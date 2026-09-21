'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n/context';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // Avoid double execution in React 18/19 Strict Mode
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const handleAuthCallback = async () => {
      try {
        // Read params from search query
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        // Also check hash fragment in case provider returned tokens/errors in hash
        const hashParams =
          typeof window !== 'undefined' && window.location.hash
            ? new URLSearchParams(window.location.hash.replace(/^#/, ''))
            : null;

        const error =
          urlParams?.get('error_description') ||
          urlParams?.get('error') ||
          hashParams?.get('error_description') ||
          hashParams?.get('error') ||
          searchParams.get('error_description') ||
          searchParams.get('error');

        if (error) {
          setErrorMessage(error);
          return;
        }

        const next = urlParams?.get('next') || searchParams.get('next') || '/';
        const code = urlParams?.get('code') || searchParams.get('code');

        if (code) {
          // 1. Check if session was already established (e.g. by supabase auto-detect)
          const { data: initialData } = await supabase.auth.getSession();
          if (initialData?.session) {
            router.replace(next);
            return;
          }

          // 2. Exchange code for session
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            // Check once more in case the session was set concurrently
            const { data: retryData } = await supabase.auth.getSession();
            if (retryData?.session) {
              router.replace(next);
              return;
            }
            setErrorMessage(exchangeError.message);
            return;
          }
        } else {
          // Check for existing session or implicit hash flow
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            setErrorMessage(sessionError.message);
            return;
          }

          if (!session) {
            // Wait briefly for Supabase listener if hash tokens are present
            await new Promise((r) => setTimeout(r, 600));
            const { data: delayedData } = await supabase.auth.getSession();
            if (!delayedData?.session) {
              router.replace('/login');
              return;
            }
          }
        }

        router.replace(next);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al procesar autenticación';
        setErrorMessage(msg);
      }
    };

    handleAuthCallback();
  }, [router, searchParams]);

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[#EEF6F6] flex flex-col items-center justify-center p-4 text-[#19322F]">
        <div className="bg-white p-8 rounded-2xl shadow-soft max-w-md w-full text-center border border-white/80">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <span className="material-icons text-2xl">error_outline</span>
          </div>
          <h2 className="text-xl font-bold mb-2">
            {t('auth.authError') || 'Error de autenticación'}
          </h2>
          <p className="text-sm text-gray-600 mb-6 break-words">{errorMessage}</p>
          <button
            onClick={() => router.replace('/login')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#006655] hover:bg-[#004d40] text-white font-medium transition-colors cursor-pointer shadow-xs"
          >
            {t('auth.tryAgain') || 'Volver a intentar'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF6F6] flex flex-col items-center justify-center p-4 text-[#19322F]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#006655] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-[#19322F]/70">
          {t('auth.authenticating') || 'Autenticando con LuxeEstate...'}
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EEF6F6] flex flex-col items-center justify-center p-4 text-[#19322F]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#006655] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-[#19322F]/70">Cargando...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
