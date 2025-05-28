import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import type { Project, Task } from "../../types/project";
import { projects, getCurrentUserId, auth } from "../../utils/api";
import ExpenseList from "./ExpenseList";
import {
  Box,
  Button,
  Card,
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
  MenuItem,
  Paper,
  Stack,
  Select,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface User {
  id: number;
  name: string;
  email: string;
}

export const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    assigneeId: undefined as number | undefined,
  });
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(
    null
  );
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const currentUserId = getCurrentUserId();
  const isOwner = project?.ownerId === currentUserId;

  useEffect(() => {
    if (id) loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await projects.getProject(parseInt(id!));
      setProject(data);
      setError(null);
    } catch (err) {
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    try {
      await projects.createTask(project.id, newTask);
      setNewTask({
        title: "",
        description: "",
        priority: "MEDIUM",
        assigneeId: undefined,
      });
      setShowNewTaskForm(false);
      loadProject();
    } catch (err) {
      setError("Failed to create task");
    }
  };

  const handleUpdateTaskStatus = async (
    task: Task,
    newStatus: "TODO" | "IN_PROGRESS" | "DONE"
  ) => {
    if (!project) return;

    // Check if the current user is the assignee
    const currentUser = project.members.find(
      (member) => member.id === task.assigneeId
    );
    if (!currentUser) {
      setError("Only the assigned person can change the task status");
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
      return;
    }

    try {
      await projects.updateTask(project.id, task.id, { status: newStatus });
      setError(null);
      loadProject();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update task");
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
    }
  };

  const isProjectOwner = () => {
    if (!project) return false;
    const currentUserId = getCurrentUserId();
    return project.ownerId === currentUserId;
  };

  const handleStatusChange = async (
    newStatus: "ACTIVE" | "COMPLETED" | "ARCHIVED"
  ) => {
    if (!project || !isProjectOwner()) return;

    try {
      await projects.updateProject(project.id, { status: newStatus });
      await loadProject();
      setStatusUpdateError(null);
    } catch (err: any) {
      setStatusUpdateError(
        err.response?.data?.error || "Failed to update project status"
      );
      setTimeout(() => setStatusUpdateError(null), 3000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "COMPLETED":
        return "primary";
      case "ARCHIVED":
        return "default";
      default:
        return "default";
    }
  };

  // Load available users when add member dialog opens
  useEffect(() => {
    if (showAddMemberDialog) {
      auth.getUsers().then((users) => {
        // Filter out users who are already members
        const memberIds = new Set(project?.members.map((m) => m.id));
        setAvailableUsers(users.filter((user: any) => !memberIds.has(user.id)));
      });
    }
  }, [showAddMemberDialog, project]);

  const handleAddMember = async () => {
    if (!project || !selectedUserId) return;

    try {
      const updatedProject = await projects.addMember(
        project.id,
        selectedUserId
      );
      setProject(updatedProject);
      setShowAddMemberDialog(false);
      setSelectedUserId("");
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to add member");
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!project) return;

    try {
      const updatedProject = await projects.removeMember(project.id, userId);
      setProject(updatedProject);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to remove member");
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
  if (!project) return <Alert severity="warning">Project not found</Alert>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <Paper
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          mb: 4,
          mx: { xs: -2, sm: 0 },
        }}
        elevation={2}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "flex-start" },
            gap: { xs: 2, sm: 3 },
            mb: 3,
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              gutterBottom
              sx={{
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                wordBreak: "break-word",
              }}
            >
              {project.name}
              <Chip
                label={project.status}
                color={
                  getStatusColor(project.status) as
                    | "success"
                    | "primary"
                    | "default"
                }
                size="small"
                sx={{ ml: 2, verticalAlign: "middle" }}
              />
            </Typography>
            {project.description && (
              <Typography
                color="text.secondary"
                sx={{
                  mb: 2,
                  display: "-webkit-box",
                  WebkitLineClamp: { xs: 3, sm: 2 },
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {project.description}
              </Typography>
            )}
          </Box>
          {isProjectOwner() && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Project Status</InputLabel>
              <Select
                value={project.status}
                label="Project Status"
                onChange={(e) =>
                  handleStatusChange(
                    e.target.value as "ACTIVE" | "COMPLETED" | "ARCHIVED"
                  )
                }
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="ARCHIVED">Archived</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>

        {statusUpdateError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {statusUpdateError}
          </Alert>
        )}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 2, sm: 3 }}
          sx={{
            flexWrap: { sm: "wrap" },
            "& .MuiBox-root": {
              minWidth: { sm: "200px" },
            },
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            sx={{
              gap: 1,
            }}
          >
            <PersonIcon sx={{ color: "primary.main" }} />
            <Typography
              noWrap
              sx={{
                maxWidth: { xs: "220px", sm: "300px" },
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Owner: {project.owner.name}
            </Typography>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            sx={{
              gap: 1,
            }}
          >
            <GroupIcon sx={{ color: "primary.main" }} />
            <Typography>{project.members.length} members</Typography>
          </Box>
        </Stack>
      </Paper>

      <Box mb={4}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" component="h2" fontWeight="bold">
            Tasks
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowNewTaskForm(true)}
          >
            New Task
          </Button>
        </Box>

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
          {project.tasks.map((task) => (
            <Box
              key={task.id}
              sx={{
                width: {
                  xs: "100%",
                  sm: "calc(50% - 16px)",
                  md: "calc(33.333% - 16px)",
                },
                minWidth: { xs: "280px", sm: "320px" },
              }}
            >
              {" "}
              <TaskCard task={task} onStatusChange={handleUpdateTaskStatus} />
            </Box>
          ))}
        </Stack>
      </Box>

      <Dialog
        open={showNewTaskForm}
        onClose={() => setShowNewTaskForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Task</DialogTitle>
        <form onSubmit={handleCreateTask}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Task Title"
              fullWidth
              required
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Priority"
              fullWidth
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  priority: e.target.value as "LOW" | "MEDIUM" | "HIGH",
                })
              }
              sx={{ mb: 2 }}
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
            </TextField>
            <TextField
              select
              label="Assign To"
              fullWidth
              value={newTask.assigneeId || ""}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  assigneeId: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
            >
              <MenuItem value="">Unassigned</MenuItem>
              {project?.members.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name || member.email}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setShowNewTaskForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create Task
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Members Section */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h6" display="flex" alignItems="center">
            <GroupIcon sx={{ mr: 1 }} /> Members
          </Typography>
          {isOwner && (
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => setShowAddMemberDialog(true)}
            >
              Add Member
            </Button>
          )}
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          {project?.members.map((member) => (
            <Chip
              key={member.id}
              icon={<PersonIcon />}
              label={`${member.name}${
                member.id === project.ownerId ? " (Owner)" : ""
              }`}
              onDelete={
                isOwner && member.id !== project.ownerId
                  ? () => handleRemoveMember(member.id)
                  : undefined
              }
              color={member.id === project.ownerId ? "primary" : "default"}
            />
          ))}
        </Stack>
      </Paper>

      {/* Add Member Dialog */}
      <Dialog
        open={showAddMemberDialog}
        onClose={() => setShowAddMemberDialog(false)}
      >
        <DialogTitle>Add Project Member</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select User</InputLabel>
            <Select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value as number)}
              label="Select User"
            >
              {availableUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddMemberDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddMember}
            variant="contained"
            disabled={!selectedUserId}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

const TaskCard = ({
  task,
  onStatusChange,
}: {
  task: Task;
  onStatusChange: (
    task: Task,
    newStatus: "TODO" | "IN_PROGRESS" | "DONE"
  ) => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "#ffffff";
      case "IN_PROGRESS":
        return "rgba(144, 202, 249, 0.1)";
      case "DONE":
        return "rgba(102, 187, 106, 0.1)";
      default:
        return "#ffffff";
    }
  };

  const getTaskStatusChipColor = (
    status: string
  ): "default" | "info" | "success" => {
    switch (status) {
      case "TODO":
        return "default";
      case "IN_PROGRESS":
        return "info";
      case "DONE":
        return "success";
      default:
        return "default";
    }
  };

  const getTaskPriorityColor = (
    priority: string
  ): "error" | "warning" | "info" => {
    switch (priority) {
      case "HIGH":
        return "error";
      case "MEDIUM":
        return "warning";
      case "LOW":
        return "info";
      default:
        return "info";
    }
  };

  return (
    <Card
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: getTaskStatusColor(task.status),
        width: "100%",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
        },
      }}
    >
      <Accordion
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        sx={{
          backgroundColor: "transparent",
          boxShadow: "none",
          "&:before": {
            display: "none",
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            padding: 0,
            "& .MuiAccordionSummary-content": {
              margin: 0,
              width: "100%",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              flexDirection: "column",
              width: "100%",
              gap: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                width: "100%",
                wordBreak: "break-word",
                mb: 1,
              }}
            >
              {task.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                width: "100%",
                wordBreak: "break-word",
              }}
            >
              {task.description}
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ pt: 1 }}>
            <ExpenseList taskId={task.id} />
          </Box>
        </AccordionDetails>
      </Accordion>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          mt: 2,
        }}
      >
        {" "}
        <Chip
          label={task.status}
          color={getTaskStatusChipColor(task.status)}
          size="small"
        />
        <Chip
          label={task.priority}
          color={getTaskPriorityColor(task.priority)}
          size="small"
        />
        {task.assignee && (
          <Chip
            icon={<PersonIcon />}
            label={task.assignee.name}
            size="small"
            variant="outlined"
          />
        )}
        <FormControl size="small" sx={{ minWidth: 120, ml: "auto" }}>
          <Select
            value={task.status}
            onChange={(e) =>
              onStatusChange(
                task,
                e.target.value as "TODO" | "IN_PROGRESS" | "DONE"
              )
            }
          >
            <MenuItem value="TODO">To Do</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="DONE">Done</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Card>
  );
};
