"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false); // Prevents hydration mismatch

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem("finwise_chats");
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      setChats(parsedChats);
      if (parsedChats.length > 0) {
        setCurrentChatId(parsedChats[0].id);
      } else {
        createNewChat();
      }
    } else {
      createNewChat();
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage whenever chats change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("finwise_chats", JSON.stringify(chats));
    }
  }, [chats, isLoaded]);

  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [],
    };
    setChats((prev) => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
  };

  const addMessage = (message) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === currentChatId) {
          // Auto-generate title based on the first user message
          const newTitle =
            chat.messages.length === 0 && message.role === "user"
              ? message.text.substring(0, 25) + "..."
              : chat.title;

          return {
            ...chat,
            title: newTitle,
            messages: [...chat.messages, message],
          };
        }
        return chat;
      })
    );
  };

  // Get the active messages array
  const currentMessages =
    chats.find((c) => c.id === currentChatId)?.messages || [];

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChatId,
        currentMessages,
        setCurrentChatId,
        createNewChat,
        addMessage,
      }}
    >
      {isLoaded ? children : null} {/* Wait for storage to load */}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);