import { Navbar } from '@/components/layout/Navbar';

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-[#EEF6F6] text-[#19322F]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Hero Skeleton */}
        <div className="py-12 md:py-16 text-center max-w-3xl mx-auto space-y-6">
          <div className="h-10 sm:h-12 bg-slate-200/80 rounded-xl w-3/4 mx-auto animate-pulse" />
          <div className="h-5 bg-slate-200/60 rounded w-1/2 mx-auto animate-pulse" />
          {/* Search bar placeholder */}
          <div className="h-14 bg-white rounded-2xl shadow-sm border border-[#006655]/10 animate-pulse mt-8 max-w-2xl mx-auto" />
        </div>

        {/* Featured Section Skeleton */}
        <section className="mb-14 space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#006655]/5 animate-pulse flex flex-col h-[380px]"
              >
                <div className="aspect-[4/3] bg-slate-200" />
                <div className="p-4 space-y-3 flex-1">
                  <div className="h-6 w-1/3 bg-slate-200 rounded" />
                  <div className="h-5 w-3/4 bg-slate-200 rounded" />
                  <div className="h-4 w-1/2 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
