import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2
      flex items-center gap-1 sm:gap-2 p-1.5
      bg-white border border-black rounded-full
      shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
      z-50 w-[92%] sm:w-auto max-w-[340px] sm:max-w-none"
    >
      <NavLink to="/" current={location.pathname === "/"}>
        Home
      </NavLink>
      
      <NavLink to="/about" current={location.pathname === "/about"}>
        About
      </NavLink>
      
      <NavLink to="/ask" current={location.pathname.includes("/ask")}>
        Workspace
      </NavLink>
    </div>
  );
}

// Sub-component for the rounded link styling
function NavLink({ to, children, current }: { to: string; children: React.ReactNode; current: boolean }) {
  return (
    <Link
      to={to}
      className={`
        flex-1 sm:flex-none text-center px-4 sm:px-6 py-2.5 sm:py-3
        text-[9px] sm:text-[10px] font-black uppercase tracking-widest
        rounded-full transition-all whitespace-nowrap
        ${current ? "bg-black text-white" : "text-black hover:bg-gray-100"}
      `}
    >
      {children}
    </Link>
  );
}