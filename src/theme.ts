import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
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

export default theme;
