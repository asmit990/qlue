import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// @ts-ignore: allow side-effect CSS import
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(

    <BrowserRouter>
      <App />
    </BrowserRouter>
 
);
