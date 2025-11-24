import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import App from "./App";
import theme from "./theme";
import "./index.css";
import { Provider } from "react-redux";
import store from "./appStore/store";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <Toaster position="top-right" />
        <App />
      </Provider>
    </ThemeProvider>
  </StrictMode>
);
