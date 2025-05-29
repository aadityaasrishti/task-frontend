import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import AuthForm from "./components/auth/AuthForm";
import Dashboard from "./components/Dashboard";
import { auth } from "./utils/api";
import ChatPage from "./components/chat/chatpage";
import { ProjectList } from "./components/project/ProjectList";
import { ProjectDetails } from "./components/project/ProjectDetails";

interface User {
  id: number;
  email: string;
  name: string;
}

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          minWidth: "320px",
          minHeight: "100vh",
        },
      },
    },
  },
});

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await auth.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Not authenticated");
      }
    };

    if (localStorage.getItem("token")) {
      checkAuth();
    }
  }, []);

  const handleAuthSuccess = (data: { user: User }) => {
    setUser(data.user);
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar
              sx={{
                flexWrap: "wrap",
                gap: { xs: 1, sm: 2 },
                py: { xs: 1, sm: 0 },
              }}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{
                  flexGrow: { xs: 1, sm: 1 },
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                }}
              >
                Task Manager
              </Typography>
              {user && (
                <Box
                  sx={{
                    display: "flex",
                    gap: { xs: 0.5, sm: 1 },
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    color="inherit"
                    component={Link}
                    to="/dashboard"
                    sx={{
                      minWidth: { xs: "auto", sm: 100 },
                      px: { xs: 1, sm: 2 },
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/projects"
                    sx={{
                      minWidth: { xs: "auto", sm: 100 },
                      px: { xs: 1, sm: 2 },
                    }}
                  >
                    Projects
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/chat"
                    sx={{
                      minWidth: { xs: "auto", sm: 100 },
                      px: { xs: 1, sm: 2 },
                    }}
                  >
                    Chat
                  </Button>
                  <Button
                    color="inherit"
                    onClick={handleLogout}
                    sx={{
                      minWidth: { xs: "auto", sm: 100 },
                      px: { xs: 1, sm: 2 },
                    }}
                  >
                    Logout
                  </Button>
                </Box>
              )}
            </Toolbar>
          </AppBar>

          <Routes>
            <Route
              path="/"
              element={
                user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/login"
              element={
                user ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <AuthForm
                    mode="login"
                    onSuccess={handleAuthSuccess}
                    onToggleMode={() => (window.location.href = "/register")}
                  />
                )
              }
            />
            <Route
              path="/register"
              element={
                user ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <AuthForm
                    mode="register"
                    onSuccess={handleAuthSuccess}
                    onToggleMode={() => (window.location.href = "/login")}
                  />
                )
              }
            />
            <Route
              path="/dashboard"
              element={user ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/chat"
              element={user ? <ChatPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/projects"
              element={user ? <ProjectList /> : <Navigate to="/login" />}
            />
            <Route
              path="/projects/:id"
              element={user ? <ProjectDetails /> : <Navigate to="/login" />}
            />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
