import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  return (
    <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-10 py-6">
      <span className="text-lg font-bold tracking-tight text-black">
        Qlue
      </span>

      <div className="flex items-center gap-8 text-sm text-gray-500">
        <button
          onClick={() => navigate("/about")}
          className="transition-colors hover:text-black"
        >
          About
        </button>

        <button
          onClick={() => navigate(isHome ? "/ask" : "/")}
          className="rounded-full bg-black px-5 py-2 text-sm text-white transition-colors hover:bg-gray-800"
        >
          {isHome ? "Get Started" : "Go Home"}
        </button>
      </div>
    </nav>
  );
}