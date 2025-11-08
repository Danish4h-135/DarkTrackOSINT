import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, User, Send, Loader2 } from "lucide-react";
import type { Message, Conversation } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Chat() {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");

  // Fetch conversations list
  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  // Fetch current conversation with messages
  const { data: conversationData, isLoading: isLoadingMessages } = useQuery<
    Conversation & { messages: Message[] }
  >({
    queryKey: ["/api/conversations", currentConversationId],
    enabled: !!currentConversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId?: string; message: string }) => {
      const res = await apiRequest("POST", "/api/chat", data);
      return await res.json();
    },
    onSuccess: (data: { conversationId: string }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", data.conversationId] });
      if (!currentConversationId) {
        setCurrentConversationId(data.conversationId);
      }
      setInputMessage("");
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      conversationId: currentConversationId || undefined,
      message: inputMessage,
    });
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
  };

  const messages = conversationData?.messages || [];
  const isLoading = isLoadingMessages || sendMessageMutation.isPending;

  return (
    <div className="container mx-auto p-6 h-full flex gap-6">
      {/* Conversations Sidebar */}
      <Card className="w-72 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
          <CardTitle className="text-lg">Conversations</CardTitle>
          <Button
            size="sm"
            onClick={handleNewConversation}
            data-testid="button-new-conversation"
          >
            New
          </Button>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full px-4">
            {conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                No conversations yet. Start a new one!
              </p>
            ) : (
              <div className="space-y-2 pb-4">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setCurrentConversationId(conv.id)}
                    className={`w-full text-left p-3 rounded-md hover-elevate active-elevate-2 ${
                      currentConversationId === conv.id ? "bg-accent" : ""
                    }`}
                    data-testid={`conversation-${conv.id}`}
                  >
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conv.updatedAt!).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>DarkTrack AI Assistant</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your personal cybersecurity companion
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6">
            {messages.length === 0 && !currentConversationId ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Welcome to DarkTrack AI
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    I'm here to help you understand your digital security, explain
                    breaches, and provide actionable cybersecurity advice.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ask me anything about your security scan, breach protection,
                    or general cybersecurity questions!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Shield className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          msg.role === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {new Date(msg.createdAt!).toLocaleTimeString()}
                      </p>
                    </div>
                    {msg.role === "user" && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-accent">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Shield className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-4">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about cybersecurity..."
                disabled={isLoading}
                data-testid="input-chat-message"
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                data-testid="button-send-message"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
