import React, { useState, useEffect, useRef } from "react";
import { api } from "../../utils/api";
import AttachmentPreview from "./AttachmentPreview";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Divider,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";

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

// Define types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult:
    | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any)
    | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, currentUserId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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

  const startSpeechRecognition = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    const SpeechRecognition = window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      if (event.results.length > 0) {
        const transcript = event.results[0][0].transcript;
        setNewMessage(transcript);
      }
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current.start();
    setIsRecording(true);
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

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
                      {" "}
                      {message.content}
                      {message.attachmentUrl && (
                        <AttachmentPreview
                          attachmentUrl={message.attachmentUrl}
                          attachmentType={message.attachmentType}
                          isCurrentUser={isCurrentUser}
                        />
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
          alignItems: "center",
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
        {selectedFile && (
          <AttachmentPreview
            file={selectedFile}
            onRemove={() => setSelectedFile(null)}
          />
        )}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          size="small"
        />
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          color="primary"
          size="small"
        >
          <AttachFileIcon />
        </IconButton>
        <IconButton
          onClick={isRecording ? stopSpeechRecognition : startSpeechRecognition}
          color={isRecording ? "error" : "primary"}
          size="small"
        >
          {isRecording ? <StopIcon /> : <MicIcon />}
        </IconButton>
        <IconButton type="submit" color="primary" size="small">
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatRoom;
