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
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Box sx={{ width: 300, borderRight: 1, borderColor: "divider" }}>
        <ChatList
          currentUserId={currentUser.id}
          onSelectChatRoom={(chatRoomId: number) =>
            setSelectedChatRoomId(chatRoomId)
          }
        />
      </Box>
      <Box sx={{ flexGrow: 1 }}>
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
