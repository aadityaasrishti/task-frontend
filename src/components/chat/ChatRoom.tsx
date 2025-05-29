import React, { useState, useEffect, useRef } from "react";
import { api, getAttachmentUrl } from "../../utils/api";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";

interface Message {
  id: number;
  content: string;
  attachmentUrl?: string;
  attachmentType?: string;
  sender: {
    id: number;
    name: string;
  };
  createdAt: string;
}

interface ChatRoomProps {
  roomId: number;
  currentUserId: number;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, currentUserId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages`);
      setMessages(response.data.reverse());
      setLoading(false);
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("content", newMessage.trim() || "Attachment");
        formData.append("attachment", selectedFile);

        const response = await api.post(
          `/chat/rooms/${roomId}/messages`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setMessages([...messages, response.data]);
      } else {
        const response = await api.post(`/chat/rooms/${roomId}/messages`, {
          content: newMessage,
        });
        setMessages([...messages, response.data]);
      }

      setNewMessage("");
      setSelectedFile(null);
      scrollToBottom();
    } catch (error: any) {
      console.error("Error sending message:", error?.response?.data || error);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          p: { xs: 1, sm: 2 },
          "& > *:not(:last-child)": {
            mb: { xs: 1.5, sm: 2 },
          },
        }}
      >
        {messages.map((message) => {
          const isCurrentUser = message.sender.id === currentUserId;
          return (
            <Box
              key={message.id}
              sx={{
                display: "flex",
                justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                mb: { xs: 1.5, sm: 2 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: isCurrentUser ? "row-reverse" : "row",
                  alignItems: "flex-start",
                  maxWidth: { xs: "90%", sm: "70%" },
                  gap: 1,
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 28, sm: 32 },
                    height: { xs: 28, sm: 32 },
                    bgcolor: isCurrentUser ? "primary.main" : "secondary.main",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                >
                  {message.sender.name[0].toUpperCase()}
                </Avatar>
                <Box sx={{ maxWidth: "100%" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: isCurrentUser ? "right" : "left",
                      mb: 0.5,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    }}
                  >
                    {message.sender.name}
                  </Typography>
                  <Paper
                    sx={{
                      p: { xs: 1, sm: 1.5 },
                      bgcolor: isCurrentUser ? "primary.main" : "grey.100",
                      color: isCurrentUser
                        ? "primary.contrastText"
                        : "text.primary",
                      borderRadius: 2,
                      maxWidth: "100%",
                      wordBreak: "break-word",
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      }}
                    >
                      {message.content}
                      {message.attachmentUrl && (
                        <Box sx={{ mt: 1 }}>
                          {message.attachmentType?.startsWith("image/") ? (
                            <img
                              src={getAttachmentUrl(
                                message.attachmentUrl || ""
                              )}
                              alt="attachment"
                              style={{
                                maxWidth: "100%",
                                maxHeight: 200,
                                borderRadius: 4,
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                window.open(
                                  getAttachmentUrl(message.attachmentUrl || ""),
                                  "_blank"
                                )
                              }
                            />
                          ) : (
                            <Box
                              component="a"
                              href={getAttachmentUrl(
                                message.attachmentUrl || ""
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                color: "inherit",
                                textDecoration: "none",
                                "&:hover": {
                                  textDecoration: "underline",
                                },
                              }}
                            >
                              <AttachFileIcon sx={{ fontSize: "1.2rem" }} />
                              <Typography variant="body2">
                                Open Attachment
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>
      <Divider />
      <Box
        component="form"
        onSubmit={sendMessage}
        sx={{
          p: { xs: 1, sm: 2 },
          backgroundColor: "background.paper",
          display: "flex",
          gap: { xs: 0.5, sm: 1 },
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          sx={{
            width: { xs: 36, sm: 40 },
            height: { xs: 36, sm: 40 },
          }}
        >
          <AttachFileIcon />
        </IconButton>
        <TextField
          fullWidth
          placeholder={
            selectedFile ? `${selectedFile.name} selected` : "Type a message..."
          }
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          variant="outlined"
          size={isMobile ? "small" : "medium"}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              fontSize: { xs: "0.875rem", sm: "1rem" },
            },
          }}
        />
        <IconButton
          type="submit"
          color="primary"
          disabled={!newMessage.trim() && !selectedFile}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            width: { xs: 36, sm: 40 },
            height: { xs: 36, sm: 40 },
            "&:hover": {
              bgcolor: "primary.dark",
            },
            "&.Mui-disabled": {
              bgcolor: "action.disabledBackground",
              color: "action.disabled",
            },
          }}
        >
          <SendIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatRoom;
