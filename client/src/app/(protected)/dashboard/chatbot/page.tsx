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
  FiSend,
  FiMenu,
  FiMessageSquare,
  FiThumbsUp,
  FiThumbsDown,
  FiTrash2,
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import requestClient from "@/lib/requestClient";
import { useSession } from "next-auth/react";
import { NextAuthUserSession } from "@/types";
import { Drawer } from "@/components/ui/Overlay";

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

interface OpenAIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const inputClassName =
  "w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500";

export default function ChatbotPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const session = useSession();
  const sessionData = session.data as NextAuthUserSession;

  const loadSessions = useCallback(() => {
    startTransition(async () => {
      try {
        const response = await requestClient({
          token: sessionData?.user?.token,
        }).get("/chatbot/sessions");

        if (response.data) setSessions(response.data.data || []);
      } catch (error) {
        console.error("Error loading sessions:", error);
        toast.error("Error loading sessions");
      }
    });
  }, [sessionData?.user?.token]);

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

            if (!id && response.data.data?.id) {
              router.push(`/dashboard/chatbot?sessionId=${response.data.data.id}`, {
                scroll: false,
              });
            }
          }
        } catch (error) {
          console.error("Error with session:", error);
          toast.error("Error loading conversation");
        } finally {
          setLoading(false);
        }
      });
    },
    [sessionData?.user?.token, router]
  );

  const deleteSession = useCallback(
    (targetSessionId: number) => {
      startTransition(async () => {
        try {
          await requestClient({
            token: sessionData?.user?.token,
          }).delete(`/chatbot/session/${targetSessionId}`);

          toast.success("Conversation deleted");
          setSessions((prev) => prev.filter((s) => s.id !== targetSessionId));

          if (currentSession?.id === targetSessionId) {
            router.push("/dashboard/chatbot", { scroll: false });
            loadSession();
          }
        } catch (error) {
          console.error("Error deleting session:", error);
          toast.error("Error deleting conversation");
        }
      });
    },
    [sessionData?.user?.token, currentSession, router, loadSession]
  );

  const sendMessage = useCallback(async () => {
    if (!message.trim() || !currentSession) return;

    const userMessage = message;
    setMessage("");

    const tempUserMsgId = `temp_user_${Date.now()}`;
    const tempAiMsgId = `temp_ai_${Date.now()}`;

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

      const openAIMessages: OpenAIChatMessage[] = [
        {
          role: "system",
          content:
            "You are an educational assistant for GrowTeens, a platform focused on empowering African teenagers with digital skills, leadership, and entrepreneurship. Be helpful, supportive, and provide accurate information. Keep your tone educational but engaging for teens.",
        },
      ];

      if (currentSession.messages?.length) {
        currentSession.messages.slice(-10).forEach((msg) => {
          openAIMessages.push({
            role: msg.role === "USER" ? "user" : "assistant",
            content: msg.content,
          });
        });
      }

      openAIMessages.push({
        role: "user",
        content: userMessage,
      });

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

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: openAIMessages }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Failed to send message: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedResponse += chunk;

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

      try {
        const saveResponse = await requestClient({
          token: sessionData?.user?.token,
        }).post("/chatbot/messages", {
          sessionId: currentSession.id,
          userMessage,
          assistantMessage: accumulatedResponse,
          aiModel: "meta-llama/llama-3.1-8b-instruct",
        });

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
        toast.warning("Your message was received but couldn't be saved.");
      }

      if (currentSession.title === "New Conversation" && accumulatedResponse) {
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
          await requestClient({
            token: sessionData?.user?.token,
          }).put(`/chatbot/session/${currentSession.id}`, { title });
          setCurrentSession((prev) => (prev ? { ...prev, title } : prev));
        }
      }

      loadSessions();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error sending message");

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
  }, [message, currentSession, sessionData?.user?.token, loadSessions]);

  const provideFeedback = useCallback(
    (messageId: number, rating: number) => {
      startTransition(async () => {
        try {
          await requestClient({
            token: sessionData?.user?.token,
          }).post(`/chatbot/feedback/${messageId}`, { rating });

          toast.success("Thank you for your feedback!");
        } catch (error) {
          console.error("Error submitting feedback:", error);
          toast.error("Error submitting feedback");
        }
      });
    },
    [sessionData?.user?.token]
  );

  useEffect(() => {
    if (sessionData?.user) {
      loadSessions();
      if (sessionId) loadSession(Number(sessionId));
      else loadSession();
    }
  }, [sessionId, sessionData, loadSessions, loadSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages]);

  return (
    <div className="relative h-[calc(100vh-80px)] overflow-hidden">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100"
            >
              <FiMenu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900">
              {currentSession?.title || "New Conversation"}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => loadSession()}
            disabled={isPending}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isPending ? "Loading..." : "New Chat"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-6">
          {(loading && !currentSession?.messages?.length) || isPending ? (
            <div className="my-10 text-center text-sm text-slate-500">Loading conversation...</div>
          ) : (
            <>
              {!currentSession?.messages?.length ? (
                <div className="mt-10 text-center text-slate-500">
                  <p className="mb-2 text-lg">Welcome to GrowTeens AI Assistant</p>
                  <p>
                    Ask questions about your courses, get help with assignments,
                    or explore learning resources.
                  </p>
                </div>
              ) : null}

              {currentSession?.messages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 flex ${
                    msg.role === "USER" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "ASSISTANT" ? (
                    <div className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      AI
                    </div>
                  ) : null}

                  <div
                    className={`max-w-[70%] rounded-3xl px-4 py-3 shadow-sm ${
                      msg.role === "USER"
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {msg.content}
                    </p>

                    {msg.role === "ASSISTANT" && typeof msg.id === "number" ? (
                      <div className="mt-2 flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => provideFeedback(msg.id as number, 5)}
                          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <FiThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => provideFeedback(msg.id as number, 1)}
                          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <FiThumbsDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {msg.role === "USER" ? (
                    <div className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                      U
                    </div>
                  ) : null}
                </div>
              ))}

              <div ref={messagesEndRef} />

              {loading ? (
                <div className="my-4 text-center text-sm text-slate-500">
                  Generating reply...
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="border-t border-slate-200 px-4 py-4">
          <div className="flex items-center gap-2">
            <input
              placeholder="Ask something about your courses..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={loading || isPending}
              className={inputClassName}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!message.trim() || !currentSession || loading || isPending}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              <FiSend className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        side="left"
        widthClassName="w-full max-w-sm"
        title="Your Conversations"
      >
        <button
          type="button"
          onClick={() => {
            loadSession();
            setIsDrawerOpen(false);
          }}
          disabled={isPending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
          <FiMessageSquare className="h-4 w-4" />
          {isPending ? "Loading..." : "New Conversation"}
        </button>

        <div className="mt-4">
          {isPending ? (
            <p className="mt-8 text-center text-sm text-slate-500">Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="mt-8 text-center text-sm text-slate-500">
              No previous conversations
            </p>
          ) : (
            <div className="space-y-2">
              {sessions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3 transition hover:bg-slate-50"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => {
                      router.push(`/dashboard/chatbot?sessionId=${item.id}`, {
                        scroll: false,
                      });
                      setIsDrawerOpen(false);
                    }}
                  >
                    <p className="truncate font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(item.id);
                    }}
                    className="rounded-full p-2 text-red-500 transition hover:bg-red-50"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
