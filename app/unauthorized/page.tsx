import Link from 'next/link';

export const metadata = {
  title: 'Acceso Denegado — LuxeEstate Admin',
};

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-[#EEF6F6] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-soft border border-[#19322F]/10 text-center relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#006655]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Shield Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-center justify-center mb-6 text-amber-700 shadow-xs">
          <span className="material-symbols-outlined text-3xl">shield_lock</span>
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-100/70 text-amber-800 mb-3">
          Error 403 — Sin Privilegios
        </span>

        <h1 className="text-2xl font-bold text-[#19322F] mb-3">
          Acceso Restringido
        </h1>

        <p className="text-sm text-[#5C706D] leading-relaxed mb-8">
          Tu cuenta no cuenta con el rol de <strong>Administrador</strong> requerido para acceder al panel de control de LuxeEstate.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#006655] hover:bg-[#004d40] text-white font-medium text-sm transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span>Volver al Inicio</span>
          </Link>

          <Link
            href="/login?next=/admin"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#19322F]/15 hover:bg-[#19322F]/5 text-[#19322F] font-medium text-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">swap_horiz</span>
            <span>Iniciar con otra cuenta</span>
          </Link>
        </div>

        <p className="text-xs text-[#5C706D]/80 mt-6">
          ¿Necesitas permisos administrativos? Contacta al equipo de soporte de LuxeEstate.
        </p>
      </div>
    </main>
  );
}
