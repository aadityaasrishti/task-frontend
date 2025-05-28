import { useState, useEffect } from "react";
import { Box, Button, Typography, AppBar, Toolbar } from "@mui/material";
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
    <BrowserRouter>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Task Manager
            </Typography>
            {user && (
              <>
                <Button color="inherit" component={Link} to="/dashboard">
                  Dashboard
                </Button>
                <Button color="inherit" component={Link} to="/projects">
                  Projects
                </Button>
                <Button color="inherit" component={Link} to="/chat">
                  Chat
                </Button>
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </>
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
                  onToggleMode={() => {}}
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
                  onToggleMode={() => {}}
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
  );
}

export default App;
