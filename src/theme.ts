import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#7f56d9",
      dark: "#6e48c7",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#feb47b",
      contrastText: "#000000ff",
    },
    info: {
      main: "#86a8e7",
    },
    text: {
      primary: "#333333",
      secondary: "#555555",
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Nunito', sans-serif",
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#9F7AEA",
      dark: "#7F56D9",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#feb47b",
      contrastText: "#000000ff",
    },
    info: {
      main: "#86a8e7",
    },
    text: {
      primary: "#e2e8f0",
      secondary: "#a0aec0",
    },
    background: {
      default: "#0f0a1a",
      paper: "#1a1528",
    },
  },
  typography: {
    fontFamily: "'Nunito', sans-serif",
  },
});

// Default export for backward compatibility
const theme = lightTheme;
export default theme;
