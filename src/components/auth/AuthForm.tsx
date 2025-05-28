import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
} from "@mui/material";
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
      if (mode === "register") {
        const data = await auth.register(formData);
        onSuccess(data);
      } else {
        const data = await auth.login({
          email: formData.email,
          password: formData.password,
        });
        onSuccess(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 8,
        }}
      >
        <Typography component="h1" variant="h5">
          {mode === "login" ? "Sign In" : "Create Account"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {mode === "login" ? "Sign In" : "Create Account"}
          </Button>

          <Button
            fullWidth
            color="secondary"
            onClick={onToggleMode}
            sx={{ mt: 1 }}
          >
            {mode === "login"
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
