import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
  Link,
} from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import { auth } from "../../utils/api";

interface AuthFormProps {
  mode: "login" | "register";
  onSuccess: (data: any) => void;
  onToggleMode: () => void;
}

export default function AuthForm({
  mode,
  onSuccess,
  onToggleMode,
}: AuthFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      let data;
      if (mode === "register") {
        data = await auth.register(formData);
      } else {
        data = await auth.login({
          email: formData.email,
          password: formData.password,
        });
      }
      // Pass both user and token to onSuccess
      onSuccess({ user: data.user, token: data.token });
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
      // Clear any invalid token
      localStorage.removeItem("token");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <LockOutlined sx={{ color: "white" }} />
          </Box>

          <Typography
            component="h1"
            variant="h5"
            sx={{ mb: 3, fontWeight: 600 }}
          >
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: "100%",
            }}
          >
            {mode === "register" && (
              <TextField
                margin="normal"
                required
                fullWidth
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                variant="outlined"
                sx={{ mb: 2 }}
              />
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              name="email"
              label="Email Address"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              variant="outlined"
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 1,
                mb: 3,
                py: 1.5,
                textTransform: "none",
                fontSize: "1.1rem",
                fontWeight: 500,
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 4,
                },
              }}
            >
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Link
                component="button"
                variant="body2"
                onClick={onToggleMode}
                sx={{
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                {mode === "login"
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Sign In"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
