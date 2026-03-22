import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-center selection:bg-indigo-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1e1b4b,transparent_70%)] opacity-50"></div>
      
      <div className="relative z-10">
        <h1 className="text-[12rem] font-black leading-none bg-gradient-to-b from-white to-white/10 bg-clip-text text-transparent italic tracking-tighter">404</h1>
        <div className="mt-[-2rem]">
          <h2 className="text-3xl font-black text-white tracking-tight uppercase italic mb-4">You've reached the void</h2>
          <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10">That page doesn't exist in our gateway. Let's get you back to safety.</p>
          <Link
            to="/app/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-100 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            ← Escape to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
