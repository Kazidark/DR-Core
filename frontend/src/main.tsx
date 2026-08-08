import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import App from "./App";

import { DRThemeProvider } from "@/design-system";

createRoot(document.getElementById("root")!).render(

    <StrictMode>

        <DRThemeProvider>

            <App/>

        </DRThemeProvider>

    </StrictMode>

);