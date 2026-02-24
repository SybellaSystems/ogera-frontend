import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import App from "./App";
import { lightTheme, darkTheme } from "./theme";
import "./index.css";
import { Provider } from "react-redux";
import store from "./appStore/store";
import { Toaster } from "react-hot-toast";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

const ThemedApp = () => {
  const { resolvedTheme } = useTheme();
  const muiTheme = resolvedTheme === "dark" ? darkTheme : lightTheme;

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Provider store={store}>
        <Toaster position="top-right" />
        <App />
      </Provider>
    </MuiThemeProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  </StrictMode>
);
