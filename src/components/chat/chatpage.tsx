import { Box } from "@mui/material";
import ChatList from "./ChatList";
import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ChatRoom from "./ChatRoom";

const ChatPage = () => {
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<number | null>(
    null
  );

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

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 64px)",
        overflow: "hidden",
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", sm: 300 },
          height: { xs: "auto", sm: "100%" },
          borderRight: 1,
          borderBottom: { xs: 1, sm: 0 },
          borderColor: "divider",
          maxHeight: { xs: "40vh", sm: "100vh" },
        }}
      >
        <ChatList
          currentUserId={currentUser.id}
          onSelectChatRoom={(chatRoomId: number) =>
            setSelectedChatRoomId(chatRoomId)
          }
        />
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          height: { xs: "60vh", sm: "100%" },
          overflow: "hidden",
        }}
      >
        {selectedChatRoomId ? (
          <ChatRoom
            roomId={selectedChatRoomId}
            currentUserId={currentUser.id}
          />
        ) : (
          <Box sx={{ p: 3 }}>Select a chat room to start messaging</Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatPage;
