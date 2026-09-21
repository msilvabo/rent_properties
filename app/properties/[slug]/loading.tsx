import { Navbar } from '@/components/layout/Navbar';

export default function PropertyLoading() {
  return (
    <div className="min-h-screen bg-[#EEF6F6] text-[#19322F]">
      {/* Navbar stays instant */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link Breadcrumb Skeleton */}
        <div className="mb-6 flex items-center gap-2">
          <div className="w-5 h-5 bg-slate-200 rounded animate-pulse" />
          <div className="w-28 h-4 bg-slate-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Main Column (8 cols): Gallery + Property Info */}
          <div className="lg:col-span-8 space-y-8">
            {/* Gallery Skeleton */}
            <div className="space-y-4">
              <div className="relative aspect-[16/10] rounded-xl bg-slate-200 animate-pulse overflow-hidden shadow-sm flex items-center justify-center">
                <span className="material-icons text-slate-300 text-6xl">photo_camera</span>
              </div>
              {/* Thumbnail Row Skeleton */}
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex-none w-44 sm:w-48 aspect-[4/3] rounded-lg bg-slate-200 animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Features Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-xl shadow-sm border border-[#006655]/5 h-24 animate-pulse flex flex-col justify-center items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200" />
                  <div className="w-16 h-3 bg-slate-200 rounded" />
                </div>
              ))}
            </div>

            {/* Description Skeleton */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#006655]/5 space-y-4 animate-pulse">
              <div className="w-40 h-6 bg-slate-200 rounded" />
              <div className="space-y-2">
                <div className="w-full h-4 bg-slate-200 rounded" />
                <div className="w-5/6 h-4 bg-slate-200 rounded" />
                <div className="w-4/6 h-4 bg-slate-200 rounded" />
              </div>
            </div>

            {/* Amenities Skeleton */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#006655]/5 space-y-4 animate-pulse">
              <div className="w-36 h-6 bg-slate-200 rounded" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar Skeleton (4 cols) */}
          <div className="lg:col-span-4 relative">
            <div className="space-y-6">
              {/* Pricing & Inquiry Card Skeleton */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#006655]/5 space-y-6 animate-pulse">
                <div className="space-y-2">
                  <div className="w-48 h-8 bg-slate-200 rounded" />
                  <div className="w-36 h-4 bg-slate-200 rounded" />
                </div>
                <div className="h-px bg-slate-100 my-6" />
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-200" />
                  <div className="space-y-2 flex-1">
                    <div className="w-28 h-4 bg-slate-200 rounded" />
                    <div className="w-20 h-3 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="h-12 bg-slate-200 rounded-lg w-full" />
              </div>

              {/* Map Card Skeleton */}
              <div className="bg-white p-2 rounded-xl shadow-sm border border-[#006655]/5 animate-pulse">
                <div className="aspect-[4/3] rounded-lg bg-slate-200 flex items-center justify-center">
                  <span className="material-icons text-slate-300 text-4xl">map</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
