import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2
      flex items-center gap-2 px-3 py-3
      rounded-full bg-white/10 backdrop-blur-xl
      border border-white/20 shadow-xl shadow-black/20 z-50"
    >
      <Link
        to="/"
        className="px-5 py-2 rounded-full font-medium hover:bg-white/20 transition-colors"
      >
        Home
      </Link>

      <Link
        to="/about"
        className="px-5 py-2 rounded-full font-medium hover:bg-white/20 transition-colors"
      >
        About Us
      </Link>

      <Link
        to="/ask"
        className="px-5 py-2 rounded-full font-medium hover:bg-white/20 transition-colors"
      >
        Ask
      </Link>
    </div>
  );
}





//       <nav className="relative z-20 h-24 border-b border-black bg-white flex items-center justify-between px-12">
 //       <div className="text-3xl font-extrabold tracking-tighter uppercase">Qlue</div>
 //       <div className="flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
 //         <a href="/" className="hover:text-black transition-colors">Home</a>
 //         <a href="/register" className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition-all">Get Started</a>
 //       </div>
 //     </nav> 