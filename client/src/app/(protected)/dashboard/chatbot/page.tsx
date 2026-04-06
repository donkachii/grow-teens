/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useTransition,
} from "react";
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Avatar,
  IconButton,
  Heading,
  Spinner,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import {
  FiSend,
  FiMenu,
  FiMessageSquare,
  FiThumbsUp,
  FiThumbsDown,
  FiTrash2,
} from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import requestClient from "@/lib/requestClient";
import { useSession } from "next-auth/react";
import { NextAuthUserSession } from "@/types";

interface ChatMessage {
  id: number | string;
  content: string;
  role: "USER" | "ASSISTANT";
  timestamp: Date;
  sessionId: number;
}

interface ChatSession {
  id: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  userId: number;
  messages?: ChatMessage[];
}

// OpenAI message format
interface OpenAIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export default function ChatbotPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const session = useSession();
  const sessionData = session.data as NextAuthUserSession;

  // List all chat sessions
  const loadSessions = useCallback(() => {
    startTransition(async () => {
      try {
        const response = await requestClient({
          token: sessionData?.user?.token,
        }).get("/chatbot/sessions");

        if (response.data) {
          setSessions(response.data.data || []);
        }
      } catch (error) {
        console.error("Error loading sessions:", error);
        toast({
          title: "Error loading sessions",
          status: "error",
          duration: 3000,
        });
      }
    });
  }, [sessionData?.user?.token, toast]);

  // Load a specific session or create a new one
  const loadSession = useCallback(
    (id?: number) => {
      startTransition(async () => {
        try {
          setLoading(true);
          const endpoint = id
            ? `/chatbot/session?sessionId=${id}`
            : "/chatbot/session";

          const response = await requestClient({
            token: sessionData?.user?.token,
          }).get(endpoint);

          if (response.data) {
            setCurrentSession(response.data.data);

            // If this is a new session, update the URL
            if (!id && response.data.data?.id) {
              router.push(
                `/dashboard/chatbot?sessionId=${response.data.data.id}`,
                { scroll: false }
              );
            }
          }
        } catch (error) {
          console.error("Error with session:", error);
          toast({
            title: "Error loading conversation",
            status: "error",
            duration: 3000,
          });
        } finally {
          setLoading(false);
        }
      });
    },
    [sessionData?.user?.token, router, toast]
  );

  // Delete a chat session
  const deleteSession = useCallback(
    (sessionId: number) => {
      startTransition(async () => {
        try {
          await requestClient({
            token: sessionData?.user?.token,
          }).delete(`/chatbot/session/${sessionId}`);

          toast({
            title: "Conversation deleted",
            status: "success",
            duration: 2000,
          });

          // Remove from local state
          setSessions((prev) => prev.filter((s) => s.id !== sessionId));

          // If this was the active session, load a new one
          if (currentSession?.id === sessionId) {
            router.push("/dashboard/chatbot", { scroll: false });
            loadSession();
          }
        } catch (error) {
          console.error("Error deleting session:", error);
          toast({
            title: "Error deleting conversation",
            status: "error",
            duration: 3000,
          });
        }
      });
    },
    [sessionData?.user?.token, toast, currentSession, router, loadSession]
  );

  // Send a message to the chatbot
  const sendMessage = useCallback(async () => {
    if (!message.trim() || !currentSession) return;

    const userMessage = message;
    setMessage("");

    // Create temporary IDs for optimistic updates
    const tempUserMsgId = `temp_user_${Date.now()}`;
    const tempAiMsgId = `temp_ai_${Date.now()}`;

    // Optimistically add user message to UI
    setCurrentSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [
          ...(prev.messages || []),
          {
            id: tempUserMsgId,
            content: userMessage,
            role: "USER",
            timestamp: new Date(),
            sessionId: prev.id,
          },
        ],
      };
    });

    try {
      setLoading(true);

      // Prepare conversation history for AI context
      const openAIMessages: OpenAIChatMessage[] = [
        {
          role: "system",
          content:
            "You are an educational assistant for GrowTeens, a platform focused on empowering African teenagers with digital skills, leadership, and entrepreneurship. Be helpful, supportive, and provide accurate information. Keep your tone educational but engaging for teens.",
        },
      ];

      // Add conversation history
      if (currentSession.messages && currentSession.messages.length > 0) {
        // Only use the last 10 messages for context
        const recentMessages = currentSession.messages.slice(-10);

        recentMessages.forEach((msg) => {
          openAIMessages.push({
            role: msg.role === "USER" ? "user" : "assistant",
            content: msg.content,
          });
        });
      }

      // Add the new user message
      openAIMessages.push({
        role: "user",
        content: userMessage,
      });

      // Add placeholder for AI response
      setCurrentSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [
            ...(prev.messages || []),
            {
              id: tempAiMsgId,
              content: "",
              role: "ASSISTANT",
              timestamp: new Date(),
              sessionId: prev.id,
            },
          ],
        };
      });

      // Stream the response from our Next.js API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: openAIMessages,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      // Process the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the stream chunk
        const chunk = decoder.decode(value, { stream: true });
        accumulatedResponse += chunk;

        // Update the AI message in real-time as it streams
        setCurrentSession((prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            messages: prev.messages?.map((msg) =>
              msg.id === tempAiMsgId
                ? { ...msg, content: accumulatedResponse }
                : msg
            ),
          };
        });
      }

      // After streaming is complete, save both messages to the backend
      try {
        const saveResponse = await requestClient({
          token: sessionData?.user?.token,
        }).post("/chatbot/messages", {
          sessionId: currentSession.id,
          userMessage: userMessage,
          assistantMessage: accumulatedResponse,
          aiModel: "meta-llama/llama-3.1-8b-instruct", // The model you're using
        });

        // Replace temporary messages with actual saved messages from the database
        if (saveResponse.data?.data) {
          const {
            userMessage: savedUserMsg,
            assistantMessage: savedAssistantMsg,
          } = saveResponse.data.data;

          setCurrentSession((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              messages: prev.messages?.map((msg) => {
                if (msg.id === tempUserMsgId) return savedUserMsg;
                if (msg.id === tempAiMsgId) return savedAssistantMsg;
                return msg;
              }),
            };
          });
        }
      } catch (saveError) {
        console.error("Error saving messages to database:", saveError);
        toast({
          title: "Error saving conversation",
          description: "Your message was received but couldn't be saved.",
          status: "warning",
          duration: 3000,
        });
      }

      // If the session was new, update the title
      if (currentSession.title === "New Conversation" && accumulatedResponse) {
        // Generate a title from the first exchange
        const titleResponse = await fetch("/api/chat/title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            response: accumulatedResponse.substring(0, 200),
          }),
        });

        if (titleResponse.ok) {
          const { title } = await titleResponse.json();

          // Update the session title
          await requestClient({
            token: sessionData?.user?.token,
          }).put(`/chatbot/session/${currentSession.id}`, { title });

          // Update local state
          setCurrentSession((prev) => (prev ? { ...prev, title } : prev));
        }
      }
      // Refresh sessions list to get updated timestamps
      loadSessions();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        status: "error",
        duration: 3000,
      });

      // Remove the optimistic messages on error
      setCurrentSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages?.filter(
            (msg) => msg.id !== tempUserMsgId && msg.id !== tempAiMsgId
          ),
        };
      });
    } finally {
      setLoading(false);
    }
  }, [message, currentSession, sessionData?.user?.token, loadSessions, toast]);

  // Provide feedback on an AI response
  const provideFeedback = useCallback(
    (messageId: number, rating: number) => {
      startTransition(async () => {
        try {
          await requestClient({
            token: sessionData?.user?.token,
          }).post(`/chatbot/feedback/${messageId}`, {
            rating,
          });

          toast({
            title: "Thank you for your feedback!",
            status: "success",
            duration: 2000,
          });
        } catch (error) {
          console.error("Error submitting feedback:", error);
          toast({
            title: "Error submitting feedback",
            status: "error",
            duration: 3000,
          });
        }
      });
    },
    [sessionData?.user?.token, toast]
  );

  // Initial data loading
  useEffect(() => {
    if (sessionData?.user) {
      loadSessions();

      if (sessionId) {
        loadSession(Number(sessionId));
      } else {
        loadSession();
      }
    }
  }, [sessionId, sessionData, loadSessions, loadSession]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages]);

  return (
    <Box height="calc(100vh - 80px)" position="relative">
      <Flex h="full" direction="column">
        {/* Header */}
        <Flex
          px={4}
          py={3}
          borderBottom="1px"
          borderColor="gray.200"
          alignItems="center"
          justifyContent="space-between"
        >
          <Flex alignItems="center">
            <IconButton
              aria-label="Menu"
              icon={<FiMenu />}
              variant="ghost"
              mr={3}
              onClick={onOpen}
            />
            <Heading size="md">
              {currentSession?.title || "New Conversation"}
            </Heading>
          </Flex>
          <Button
            size="sm"
            colorScheme="primary"
            onClick={() => loadSession()}
            isLoading={isPending}
          >
            New Chat
          </Button>
        </Flex>

        {/* Messages */}
        <Box flex="1" overflowY="auto" px={4} py={6} bg="gray.50">
          {(loading && !currentSession?.messages?.length) || isPending ? (
            <Flex justifyContent="center" my={10}>
              <Spinner size="xl" />
            </Flex>
          ) : (
            <>
              {!currentSession?.messages?.length && (
                <Box textAlign="center" color="gray.500" mt={10}>
                  <Text fontSize="lg" mb={2}>
                    Welcome to GrowTeens AI Assistant
                  </Text>
                  <Text>
                    Ask questions about your courses, get help with assignments,
                    or explore learning resources.
                  </Text>
                </Box>
              )}

              {currentSession?.messages?.map((msg) => (
                <Flex
                  key={msg.id}
                  mb={4}
                  justifyContent={
                    msg.role === "USER" ? "flex-end" : "flex-start"
                  }
                >
                  {msg.role === "ASSISTANT" && (
                    <Avatar
                      size="sm"
                      bg="primary.500"
                      color="white"
                      name="GrowTeens AI"
                      mr={2}
                    />
                  )}

                  <Box
                    maxW="70%"
                    bg={msg.role === "USER" ? "primary.500" : "white"}
                    color={msg.role === "USER" ? "white" : "black"}
                    p={3}
                    borderRadius="lg"
                    boxShadow="sm"
                  >
                    <Text whiteSpace="pre-wrap">{msg.content}</Text>

                    {msg.role === "ASSISTANT" && typeof msg.id === "number" && (
                      <Flex mt={2} justifyContent="flex-end" gap={1}>
                        <IconButton
                          aria-label="Thumbs Up"
                          icon={<FiThumbsUp size={14} />}
                          size="xs"
                          variant="ghost"
                          onClick={() => provideFeedback(msg.id as number, 5)}
                        />
                        <IconButton
                          aria-label="Thumbs Down"
                          icon={<FiThumbsDown size={14} />}
                          size="xs"
                          variant="ghost"
                          onClick={() => provideFeedback(msg.id as number, 1)}
                        />
                      </Flex>
                    )}
                  </Box>

                  {msg.role === "USER" && <Avatar size="sm" ml={2} />}
                </Flex>
              ))}
              <div ref={messagesEndRef} />

              {loading && (
                <Flex justifyContent="center" my={4}>
                  <Spinner size="sm" />
                </Flex>
              )}
            </>
          )}
        </Box>

        {/* Input */}
        <Flex p={4} borderTop="1px" borderColor="gray.200" alignItems="center">
          <Input
            placeholder="Ask something about your courses..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            mr={2}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={loading || isPending}
          />
          <IconButton
            aria-label="Send message"
            icon={<FiSend />}
            colorScheme="primary"
            isLoading={loading || isPending}
            onClick={sendMessage}
            disabled={!message.trim() || !currentSession}
          />
        </Flex>
      </Flex>

      {/* Sessions Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Your Conversations</DrawerHeader>

          <DrawerBody>
            <Button
              leftIcon={<FiMessageSquare />}
              colorScheme="primary"
              width="full"
              mb={4}
              onClick={() => {
                loadSession();
                onClose();
              }}
              isLoading={isPending}
            >
              New Conversation
            </Button>

            {isPending ? (
              <Spinner size="md" mx="auto" mt={8} display="block" />
            ) : sessions.length === 0 ? (
              <Text color="gray.500" textAlign="center" mt={8}>
                No previous conversations
              </Text>
            ) : (
              sessions.map((session) => (
                <Flex
                  key={session.id}
                  p={3}
                  _hover={{ bg: "gray.100" }}
                  borderRadius="md"
                  mb={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box
                    cursor="pointer"
                    flex="1"
                    onClick={() => {
                      router.push(
                        `/dashboard/chatbot?sessionId=${session.id}`,
                        { scroll: false }
                      );
                      onClose();
                    }}
                  >
                    <Text fontWeight="medium" noOfLines={1}>
                      {session.title}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </Text>
                  </Box>

                  <IconButton
                    aria-label="Delete conversation"
                    icon={<FiTrash2 size={16} />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                  />
                </Flex>
              ))
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
