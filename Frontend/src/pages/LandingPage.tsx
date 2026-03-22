import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 overflow-hidden relative font-sans">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
      
      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <span className="text-lg font-black text-white italic">OG</span>
          </div>
          <span className="text-xl font-black tracking-tighter italic text-slate-900">OllamaGate</span>
        </div>
        <Link 
          to="/login" 
          className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-8 animate-fade-in shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Enterprise Ready Gateway</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9] italic animate-slide-up text-slate-950">
          THE GATEWAY TO <br />
          <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
            PERSONAL AI
          </span>
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-slate-500 mb-12 font-bold leading-relaxed animate-slide-up uppercase tracking-tight">
          OllamaGate provides a secure, high-performance API boundary for your local models. 
          Manage keys, track usage, and scale development with precision.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up">
          <Link
            to="/login"
            className="group relative px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
          >
            Launch Console
          </Link>
          <button className="px-10 py-5 bg-white border border-slate-200 text-slate-900 font-black rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">
            Documentation
          </button>
        </div>

        {/* Dashboard Preview Mockup (Light Mode) */}
        <div className="mt-24 relative group animate-fade-in">
          <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-[3rem] -z-10"></div>
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-2xl overflow-hidden max-w-5xl mx-auto ring-1 ring-slate-100 transition-transform duration-700 group-hover:scale-[1.01]">
            <div className="flex items-center gap-2 mb-4 px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
              <div className="flex-1"></div>
              <div className="h-4 w-32 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="grid grid-cols-12 gap-4 p-4">
              <div className="col-span-3 space-y-4">
                <div className="h-32 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse"></div>
                <div className="h-32 bg-slate-100/50 rounded-2xl border border-slate-100"></div>
              </div>
              <div className="col-span-9 space-y-4">
                <div className="h-64 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-center">
                   <div className="w-full h-full p-8 flex flex-col justify-end">
                      <div className="flex gap-2 items-end">
                        {[40, 70, 45, 90, 65, 80, 50, 85, 95, 60].map((h, i) => (
                          <div key={i} className="flex-1 bg-indigo-100 rounded-t-lg transition-all duration-1000" style={{ height: `${h}%` }}></div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 max-w-7xl mx-auto px-8 py-20 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center md:text-left">
          © 2024 OllamaGate. Premium White Label API Gateway.
        </p>
        <div className="flex gap-8">
          {['Privacy', 'Terms', 'Docs'].map(item => (
            <a key={item} href="#" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">{item}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
