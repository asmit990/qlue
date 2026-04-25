import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";
import Landing from "./pages.tsx/landing";
import AboutUs from "./pages.tsx/aboutUs";
import Ask from "./pages.tsx/ask";
import Header from "./components/header";
export default function App() {
  return (
    <div className="relative min-h-screen w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] overflow-auto">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/ask" element={<Ask />} />
      </Routes>
      <Navbar />
      <Header />
    </div>
  );
}
