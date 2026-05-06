     
import React from "react"
import { useNavigate } from "react-router-dom"

export default function Header() {

const navigate = useNavigate();
  <>
  
 {/* 2. Top Navigation Bar */}
      <nav className="relative z-20 h-20 border-b border-gray-200 bg-white/50 backdrop-blur-md flex items-center justify-between px-10">
        <span
  onClick={() => navigate("/")}
  className="text-3xl font-extrabold tracking-tighter uppercase"
>
  Qlue
</span>
        <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
          <a onClick={ () => navigate("/about")} className="hover:text-black transition-colors">About</a>
          <a onClick={ () => navigate("/register")} className="px-5 py-2 border border-black text-black hover:bg-black hover:text-white transition-all">
            Register
          </a>
        </div>
      </nav>
  </>

}
