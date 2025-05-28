import { useState, useEffect } from "react";
import type { Project } from "../../types/project";
import { projects, auth } from "../../utils/api";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FolderIcon from "@mui/icons-material/Folder";

interface User {
  id: number;
  name: string;
  email: string;
}

export const ProjectList = () => {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    memberIds: [] as number[],
  });
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projects.getProjects();
      setProjectList(data);
      setError(null);
    } catch (err) {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const users = await auth.getUsers();
      setAvailableUsers(users);
    } catch (err) {
      setError("Failed to load users");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await projects.createProject(newProject);
      setNewProject({ name: "", description: "", memberIds: [] });
      setShowNewProjectForm(false);
      loadProjects();
    } catch (err) {
      setError("Failed to create project");
    }
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowNewProjectForm(true)}
        >
          New Project
        </Button>
      </Box>

      <Dialog
        open={showNewProjectForm}
        onClose={() => setShowNewProjectForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Project</DialogTitle>
        <form onSubmit={handleCreateProject}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Project Name"
              fullWidth
              required
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newProject.description}
              onChange={(e) =>
                setNewProject({
                  ...newProject,
                  description: e.target.value,
                })
              }
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Members</InputLabel>
              <Select
                multiple
                value={newProject.memberIds}
                onChange={(e) =>
                  setNewProject({
                    ...newProject,
                    memberIds: e.target.value as number[],
                  })
                }
                renderValue={(selected) => {
                  const selectedUsers = availableUsers.filter((user) =>
                    (selected as number[]).includes(user.id)
                  );
                  return selectedUsers.map((user) => user.name).join(", ");
                }}
              >
                {availableUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setShowNewProjectForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create Project
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Stack
        spacing={3}
        useFlexGap
        sx={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: { xs: 2, sm: 3 },
          mx: { xs: -2, sm: 0 },
        }}
      >
        {projectList.map((project) => (
          <Box
            key={project.id}
            sx={{
              width: {
                xs: "100%",
                sm: "calc(50% - 16px)",
                md: "calc(33.333% - 16px)",
              },
              minWidth: { xs: "280px", sm: "320px" },
            }}
          >
            <Card
              component={Link}
              to={`/projects/${project.id}`}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s",
                textDecoration: "none",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardContent
                sx={{
                  flexGrow: 1,
                  p: { xs: 2, sm: 3 },
                  "&:last-child": { pb: { xs: 2, sm: 3 } },
                }}
              >
                <Box
                  display="flex"
                  alignItems="flex-start"
                  mb={2}
                  sx={{
                    gap: 1,
                  }}
                >
                  <FolderIcon
                    sx={{
                      color: "primary.main",
                      fontSize: { xs: "1.5rem", sm: "1.75rem" },
                      mt: 0.5,
                    }}
                  />
                  <Typography
                    variant="h6"
                    component="h2"
                    sx={{
                      fontSize: { xs: "1.1rem", sm: "1.25rem" },
                      lineHeight: 1.3,
                      wordBreak: "break-word",
                    }}
                  >
                    {project.name}
                  </Typography>
                </Box>
                {project.description && (
                  <Typography
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    {project.description}
                  </Typography>
                )}
                <Box
                  display="flex"
                  gap={1}
                  sx={{
                    flexWrap: "wrap",
                    mt: "auto",
                    "& .MuiChip-root": {
                      mb: 0.5,
                    },
                  }}
                >
                  <Chip
                    size="small"
                    label={project.status}
                    color={project.status === "ACTIVE" ? "success" : "default"}
                    sx={{
                      fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                    }}
                  />
                  <Chip
                    size="small"
                    label={`${project.members.length} members`}
                    variant="outlined"
                    sx={{
                      fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Stack>
    </Container>
  );
};
