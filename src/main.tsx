import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./App.tsx";
import ReactQueryProvider from "./providers/react-query-provider.tsx";
import About from "./pages/about.tsx";
import { Toaster } from "@/components/ui/sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ReactQueryProvider>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route index element={<App />} />
          <Route path="about" element={<About />} />
        </Routes>
      </ReactQueryProvider>
    </BrowserRouter>
  </StrictMode>
);
