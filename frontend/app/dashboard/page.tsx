"use client";

import { useEffect, useState } from "react";
import {
  Menu,
  Plus,
  Send,
  User,
  Settings,
  LogOut,
  MoreHorizontal,
  Share2,
  Pencil,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Chat = {
  id: string;
  title: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState("");

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [loadingChats, setLoadingChats] = useState(true);
  const [sending, setSending] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [currentMenuOpen, setCurrentMenuOpen] = useState(false);

  const [enterToSend, setEnterToSend] = useState(true);
  const [showChatHistory, setShowChatHistory] = useState(true);

  useEffect(() => {
    loadSettings();
    loadChats();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      loadSettings();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // ----------------------------------------
  // LOAD SETTINGS
  // ----------------------------------------

  function loadSettings() {
    const saved = localStorage.getItem("eduvigo-settings");

    if (!saved) {
      setEnterToSend(true);
      setShowChatHistory(true);
      return;
    }

    try {
      const settings = JSON.parse(saved);

      setEnterToSend(settings.enterToSend ?? true);
      setShowChatHistory(settings.chatHistory ?? true);
    } catch (error) {
      console.error("Unable to load EduViGo settings:", error);

      setEnterToSend(true);
      setShowChatHistory(true);
    }
  }

  // ----------------------------------------
  // LOAD CHATS
  // ----------------------------------------

  async function loadChats() {
    setLoadingChats(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data, error } = await supabase
      .from("conversations")
      .select("id, title")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading chats:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    } else {
      setChats(data || []);
    }

    setLoadingChats(false);
  }

  // ----------------------------------------
  // CREATE NEW CHAT
  // ----------------------------------------

  function createNewChat() {
    setActiveChatId(null);
    setMessages([]);
    setInput("");
    setOpenMenuId(null);
    setCurrentMenuOpen(false);
  }

  // ----------------------------------------
  // OPEN CHAT
  // ----------------------------------------

  async function openChat(chatId: string) {
    setActiveChatId(chatId);
    setOpenMenuId(null);
    setCurrentMenuOpen(false);

    const { data, error } = await supabase
      .from("messages")
      .select("id, role, content")
      .eq("conversation_id", chatId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      return;
    }

    setMessages(data ?? []);
  }

  // ----------------------------------------
  // SEND MESSAGE
  // ----------------------------------------

  async function handleSend() {
    const content = input.trim();

    if (!content || sending) return;

    setSending(true);

    let conversationId = activeChatId;

    try {
      // ----------------------------------------
      // 1. GET CURRENT USER
      // ----------------------------------------

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      // ----------------------------------------
      // 2. CREATE CONVERSATION IF NEEDED
      // ----------------------------------------

      if (!conversationId) {
        const title =
          content.length > 40
            ? `${content.slice(0, 40)}...`
            : content;

        const { data, error } = await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            title,
          })
          .select("id, title")
          .single();

        if (error) {
          console.error("Error creating conversation:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });

          return;
        }

        conversationId = data.id;

        setChats((current) => [data, ...current]);
        setActiveChatId(data.id);
      }

      // ----------------------------------------
      // 3. SAVE USER MESSAGE
      // ----------------------------------------

      const {
        data: userMessage,
        error: userMessageError,
      } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          role: "user",
          content,
        })
        .select("id, role, content")
        .single();

      if (userMessageError) {
        console.error("Error saving user message:", {
          message: userMessageError.message,
          details: userMessageError.details,
          hint: userMessageError.hint,
          code: userMessageError.code,
        });

        return;
      }

      setMessages((current) => [...current, userMessage]);
      setInput("");

      // ----------------------------------------
      // 4. SEND QUESTION TO FASTAPI
      // ----------------------------------------

      const response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: content,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `FastAPI request failed: ${response.status} ${errorText}`
        );
      }

      const aiData = await response.json();

      if (!aiData.answer) {
        throw new Error("FastAPI returned no AI answer.");
      }

      // ----------------------------------------
      // 5. SAVE AI RESPONSE
      // ----------------------------------------

      const {
        data: assistantMessage,
        error: assistantError,
      } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          role: "assistant",
          content: aiData.answer,
        })
        .select("id, role, content")
        .single();

      if (assistantError) {
        console.error("Error saving AI message:", {
          message: assistantError.message,
          details: assistantError.details,
          hint: assistantError.hint,
          code: assistantError.code,
        });

        return;
      }

      // ----------------------------------------
      // 6. SHOW AI RESPONSE
      // ----------------------------------------

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  }

  // ----------------------------------------
  // DELETE CHAT
  // ----------------------------------------

  async function deleteChat(chatId: string) {
    const confirmed = window.confirm(
      "Delete this chat? This will also delete all messages in it."
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", chatId);

    if (error) {
      console.error("Error deleting chat:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      return;
    }

    setChats((current) =>
      current.filter((chat) => chat.id !== chatId)
    );

    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([]);
      setInput("");
    }

    setOpenMenuId(null);
    setCurrentMenuOpen(false);
  }

  // ----------------------------------------
  // RENAME CHAT
  // ----------------------------------------

  async function renameChat(chat: Chat) {
    const newTitle = window.prompt(
      "Enter a new chat name:",
      chat.title
    );

    if (newTitle === null) return;

    const title = newTitle.trim();

    if (!title) return;

    const { error } = await supabase
      .from("conversations")
      .update({ title })
      .eq("id", chat.id);

    if (error) {
      console.error("Error renaming chat:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });

      return;
    }

    setChats((current) =>
      current.map((item) =>
        item.id === chat.id
          ? { ...item, title }
          : item
      )
    );

    setOpenMenuId(null);
  }

  // ----------------------------------------
  // SHARE CHAT
  // ----------------------------------------

  async function shareChat(chatId: string) {
    const shareUrl = `${window.location.origin}/dashboard?chat=${chatId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);

      window.alert("Chat link copied to clipboard.");
    } catch (error) {
      console.error("Error copying chat link:", error);

      window.alert("Unable to copy the chat link.");
    }

    setOpenMenuId(null);
    setCurrentMenuOpen(false);
  }

  // ----------------------------------------
  // LOGOUT
  // ----------------------------------------

  async function handleLogout() {
    await supabase.auth.signOut();

    window.location.href = "/login";
  }

  // ----------------------------------------
  // UI
  // ----------------------------------------

  return (
    <main className="flex h-screen overflow-hidden bg-white text-gray-900">
      {/* ================= SIDEBAR ================= */}

      <aside
        className={`flex flex-col border-r border-gray-200 bg-gray-50 transition-all duration-200 ${
          sidebarOpen
            ? "w-64 shrink-0"
            : "w-0 overflow-hidden"
        }`}
      >
        <div className="flex h-full flex-col p-3">

          {/* Logo */}

          <div className="mb-4 px-3 py-3">
            <h1 className="text-xl font-bold tracking-tight">
              EduViGo
            </h1>
          </div>

          {/* New Chat */}

          <button
            onClick={createNewChat}
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium transition hover:bg-gray-100"
          >
            <Plus size={18} />
            New Chat
          </button>

          {/* Chat History */}

          {showChatHistory && (
            <div className="mt-6 flex-1 overflow-y-auto">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Chat History
              </p>

              {loadingChats ? (
                <p className="px-3 py-3 text-sm text-gray-400">
                  Loading...
                </p>
              ) : chats.length === 0 ? (
                <p className="px-3 py-3 text-sm text-gray-400">
                  No conversations yet
                </p>
              ) : (
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`group relative flex items-center rounded-lg ${
                        activeChatId === chat.id
                          ? "bg-gray-200"
                          : "hover:bg-gray-200"
                      }`}
                    >
                      <button
                        onClick={() => openChat(chat.id)}
                        className={`min-w-0 flex-1 truncate px-3 py-2 text-left text-sm ${
                          activeChatId === chat.id
                            ? "text-gray-900"
                            : "text-gray-600"
                        }`}
                      >
                        {chat.title}
                      </button>

                      <button
                        onClick={(event) => {
                          event.stopPropagation();

                          setCurrentMenuOpen(false);

                          setOpenMenuId(
                            openMenuId === chat.id
                              ? null
                              : chat.id
                          );
                        }}
                        className="mr-1 rounded-md p-1.5 text-gray-400 opacity-0 transition hover:bg-gray-300 hover:text-gray-700 group-hover:opacity-100"
                        title="Chat options"
                      >
                        <MoreHorizontal size={17} />
                      </button>

                      {openMenuId === chat.id && (
                        <div className="absolute right-2 top-10 z-50 w-40 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
                          <button
                            onClick={() =>
                              shareChat(chat.id)
                            }
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Share2 size={15} />
                            Share
                          </button>

                          <button
                            onClick={() =>
                              renameChat(chat)
                            }
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Pencil size={15} />
                            Rename
                          </button>

                          <div className="my-1 border-t border-gray-100" />

                          <button
                            onClick={() =>
                              deleteChat(chat.id)
                            }
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bottom Sidebar */}

          <div className="shrink-0 border-t border-gray-200 pt-3">

            <button
              onClick={() => {
                window.location.href =
                  "/dashboard/account";
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-200"
            >
              <User size={18} />
              Account
            </button>

            <button
              onClick={() => {
                window.location.href =
                  "/dashboard/settings";
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-200"
            >
              <Settings size={18} />
              Settings
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-200"
            >
              <LogOut size={18} />
              Logout
            </button>

          </div>
        </div>
      </aside>

      {/* ================= MAIN CHAT ================= */}

      <section className="flex min-w-0 flex-1 flex-col">

        {/* Header */}

        <header className="flex h-14 shrink-0 items-center border-b border-gray-200 px-4">

          <button
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            title="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          <span className="ml-3 text-sm font-medium text-gray-700">
            {activeChatId ? "Chat" : "New Chat"}
          </span>

          {activeChatId && (
            <div className="relative ml-auto">

              <button
                onClick={() => {
                  setOpenMenuId(null);

                  setCurrentMenuOpen(
                    !currentMenuOpen
                  );
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                title="Chat options"
              >
                <MoreHorizontal size={20} />
              </button>

              {currentMenuOpen && (
                <div className="absolute right-0 top-11 z-50 w-40 rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">

                  <button
                    onClick={() =>
                      shareChat(activeChatId)
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Share2 size={15} />
                    Share
                  </button>

                  <button
                    onClick={() => {
                      const currentChat =
                        chats.find(
                          (chat) =>
                            chat.id === activeChatId
                        );

                      if (currentChat) {
                        renameChat(currentChat);
                      }

                      setCurrentMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Pencil size={15} />
                    Rename
                  </button>

                  <div className="my-1 border-t border-gray-100" />

                  <button
                    onClick={() =>
                      deleteChat(activeChatId)
                    }
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>

                </div>
              )}

            </div>
          )}

        </header>

        {/* ================= MESSAGES ================= */}

        <div className="flex-1 overflow-y-auto px-6 py-8">

          {messages.length === 0 ? (

            <div className="flex h-full items-center justify-center">
              <div className="max-w-2xl text-center">

                <h2 className="text-3xl font-semibold tracking-tight">
                  How can I help you study?
                </h2>

                <p className="mt-3 text-gray-500">
                  Ask EduViGo about your subjects,
                  modules, questions, or exam preparation.
                </p>

              </div>
            </div>

          ) : (

            <div className="w-full space-y-6">

              {messages.map((message) => (

                <div
                  key={message.id}
                  className={`flex w-full ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.role === "user"
                        ? "ml-auto bg-black text-white"
                        : "mr-auto bg-gray-100 text-gray-900"
                    }`}
                  >
                    {message.content}
                  </div>

                </div>

              ))}

              {sending && (
                <div className="flex w-full justify-start">
                  <div className="mr-auto rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-500">
                    EduViGo is thinking...
                  </div>
                </div>
              )}

            </div>

          )}

        </div>

        {/* ================= INPUT ================= */}

        <div className="shrink-0 px-6 pb-6">

          <div className="mx-auto flex max-w-3xl items-end rounded-2xl border border-gray-300 bg-white p-2 shadow-sm focus-within:border-gray-500">

            <textarea
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;

                if (
                  enterToSend &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask EduViGo..."
              rows={1}
              disabled={sending}
              className="max-h-32 min-h-11 flex-1 resize-none px-3 py-2.5 text-sm outline-none"
            />

            <button
              onClick={handleSend}
              disabled={
                !input.trim() || sending
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              title="Send message"
            >
              <Send size={18} />
            </button>

          </div>

          <p className="mt-2 text-center text-xs text-gray-400">
            EduViGo can make mistakes. Verify important
            information.
          </p>

        </div>

      </section>
    </main>
  );
}