import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Typography,
  Fab,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";

interface Room {
  id: number;
  name: string;
  isPrivate: boolean;
  owner: {
    id: number;
    name: string;
  };
  members: Array<{
    id: number;
    name: string;
  }>;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface ChatListProps {
  currentUserId: number;
  onSelectChatRoom?: (chatRoomId: number) => void;
}

const ChatList: React.FC<ChatListProps> = ({
  currentUserId,
  onSelectChatRoom,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showNewRoomForm, setShowNewRoomForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [error, setError] = useState<string>("");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchRooms();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/chat/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await api.get("/chat/rooms");
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleCreateRoom = async () => {
    try {
      setError("");
      if (!newRoomName.trim()) {
        setError("Room name is required");
        return;
      }
      if (selectedUsers.length === 0) {
        setError("Please select at least one member");
        return;
      }
      await api.post("/chat/rooms", {
        name: newRoomName,
        isPrivate,
        memberIds: selectedUsers,
      });
      setShowNewRoomForm(false);
      setNewRoomName("");
      setIsPrivate(false);
      setSelectedUsers([]);
      fetchRooms();
    } catch (error: any) {
      console.error("Error creating room:", error);
      setError(error.response?.data?.message || "Failed to create chat room");
    }
  };

  const handleRoomClick = (roomId: number) => {
    if (onSelectChatRoom) {
      onSelectChatRoom(roomId);
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: { xs: "300px", sm: "auto" },
      }}
    >
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
        >
          Chat Rooms
        </Typography>
      </Box>

      <List
        sx={{
          flexGrow: 1,
          overflow: "auto",
          py: 0,
        }}
      >
        {rooms.map((room) => (
          <ListItem
            key={room.id}
            component="div"
            onClick={() => handleRoomClick(room.id)}
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              cursor: "pointer",
              py: { xs: 1, sm: 1.5 },
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
              {room.isPrivate ? <LockIcon /> : <PublicIcon />}
            </ListItemIcon>
            <ListItemText
              primary={room.name}
              secondary={`Owner: ${room.owner.name}`}
              primaryTypographyProps={{
                sx: {
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  fontWeight: 500,
                },
              }}
              secondaryTypographyProps={{
                sx: { fontSize: { xs: "0.75rem", sm: "0.875rem" } },
              }}
            />
          </ListItem>
        ))}
      </List>

      <Box
        sx={{
          p: { xs: 1, sm: 2 },
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Fab
          color="primary"
          size={isMobile ? "small" : "medium"}
          onClick={() => setShowNewRoomForm(true)}
          sx={{ width: "100%" }}
        >
          <AddIcon />
        </Fab>
      </Box>

      <Dialog
        open={showNewRoomForm}
        onClose={() => setShowNewRoomForm(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            margin: { xs: 2, sm: "auto" },
            width: { xs: "calc(100% - 32px)", sm: "600px" },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
          Create New Chat Room
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              fullWidth
              label="Room Name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              error={!!error}
              helperText={error}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  size={isMobile ? "small" : "medium"}
                />
              }
              label="Private Room"
            />
            <Typography
              variant="subtitle2"
              sx={{ mt: 1, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
            >
              Select Members:
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                maxHeight: { xs: 150, sm: 200 },
                overflowY: "auto",
              }}
            >
              <List dense>
                {users
                  .filter((user) => user.id !== currentUserId)
                  .map((user) => (
                    <ListItem key={user.id} dense>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => {
                              if (selectedUsers.includes(user.id)) {
                                setSelectedUsers(
                                  selectedUsers.filter((id) => id !== user.id)
                                );
                              } else {
                                setSelectedUsers([...selectedUsers, user.id]);
                              }
                            }}
                            size={isMobile ? "small" : "medium"}
                          />
                        }
                        label={
                          <Typography
                            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                          >
                            {user.name}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
              </List>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Button
            onClick={() => setShowNewRoomForm(false)}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateRoom}
            variant="contained"
            disabled={!newRoomName.trim() || selectedUsers.length === 0}
            size={isMobile ? "small" : "medium"}
          >
            Create Room
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatList;
