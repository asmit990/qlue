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
