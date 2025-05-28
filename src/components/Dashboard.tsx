import {  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";
import { api } from "../utils/api";
import type { Task } from "../types/project";

interface Message {
  id: number;
  content: string;
  createdAt: string;
  sender: {
    id: number;
    name: string;
  };
  room: {
    id: number;
    name: string;
  };
}

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [newMessages, setNewMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/auth/me");
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchAssignedTasks = async () => {
      if (!currentUser) return;

      try {
        const response = await api.get(
          `/projects/tasks/assigned/${currentUser.id}`
        );
        setAssignedTasks(response.data);
      } catch (error) {
        console.error("Error fetching assigned tasks:", error);
      }
    };

    const fetchNewMessages = async () => {
      if (!currentUser) return;

      try {
        const response = await api.get("/chat/messages/new");
        setNewMessages(response.data);
      } catch (error) {
        console.error("Error fetching new messages:", error);
      }
    };

    if (currentUser) {
      fetchAssignedTasks();
      fetchNewMessages();
    }
  }, [currentUser]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "default";
      case "IN_PROGRESS":
        return "primary";
      case "DONE":
        return "success";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "error";
      case "MEDIUM":
        return "warning";
      case "LOW":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ flexGrow: 1, height: "100vh", overflow: "auto", p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Welcome, {currentUser.name}!
      </Typography>

      <Stack spacing={3}>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Your Assigned Tasks
          </Typography>
          {assignedTasks.length > 0 ? (
            <List>
              {assignedTasks.map((task) => (
                <ListItem
                  key={task.id}
                  sx={{
                    mb: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography variant="subtitle1">{task.title}</Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            size="small"
                            label={task.status}
                            color={getStatusColor(task.status)}
                          />
                          <Chip
                            size="small"
                            label={task.priority}
                            color={getPriorityColor(task.priority)}
                          />
                        </Stack>
                      </Box>
                    }
                    secondary={
                      <>
                        <span>Project: {task.project?.name || task.projectId}</span>
                        {task.description && (
                          <span style={{ display: 'block', marginTop: '4px' }}>
                            {task.description}
                          </span>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">
              No tasks assigned to you yet.
            </Typography>
          )}
        </Paper>

        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            New Messages
          </Typography>
          <List>
            {newMessages.length === 0 ? (
              <ListItem>
                <ListItemText primary="No new messages" />
              </ListItem>
            ) : (
              newMessages.map((message) => (
                <ListItem key={message.id}>
                  <ListItemText
                    primary={message.content}
                    secondary={
                      <>
                        From {message.sender.name} in {message.room.name} •{" "}
                        {new Date(message.createdAt).toLocaleString()}
                      </>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      </Stack>
    </Box>
  );
};

export default Dashboard;
