import { createContext, useContext, useState } from "react";
import { getTotalUnreadChatCount } from "../services/chatApiService";
import { useAuth } from "../context/AuthContext";
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { logout, loginResponse } = useAuth();

  const [messageCount, setMessageCount] = useState(0);

  const getChatUnreadCount = async () => {
    try {
      const response = await getTotalUnreadChatCount({
        userId: loginResponse?.data?._id,
      });
      setMessageCount(response?.totalChatCount || 0);
    } catch (error) {
      console.error("Failed to fetch unread chat count:", error);
    }
  };

  return (
    <ChatContext.Provider value={{ messageCount, getChatUnreadCount }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
