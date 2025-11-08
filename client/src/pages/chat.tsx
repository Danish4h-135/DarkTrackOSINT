import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, User, Send, Menu, ArrowDown, X, Plus } from "lucide-react";
import type { Message, Conversation } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-muted-foreground/60 rounded-full"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function Chat() {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [breachContextProcessed, setBreachContextProcessed] = useState(false);
  const { toast } = useToast();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to send message");
      }
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
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
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
    setShowSidebar(false);
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrolledFromBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    setShowScrollButton(scrolledFromBottom > 2000);
  };

  const messages = conversationData?.messages || [];
  const isLoading = isLoadingMessages || sendMessageMutation.isPending;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("smooth");
    }
  }, [messages.length]);

  // Auto-scroll when loading state changes (new message being sent)
  useEffect(() => {
    if (sendMessageMutation.isPending) {
      scrollToBottom("smooth");
    }
  }, [sendMessageMutation.isPending]);

  // Handle breach context from sessionStorage
  useEffect(() => {
    if (breachContextProcessed) return;

    const breachContextStr = sessionStorage.getItem('breachContext');
    if (breachContextStr) {
      try {
        const breachContext = JSON.parse(breachContextStr);
        sessionStorage.removeItem('breachContext');
        setBreachContextProcessed(true);

        const dataClassesStr = breachContext.dataClasses && breachContext.dataClasses.length > 0
          ? ` The compromised data includes: ${breachContext.dataClasses.join(', ')}.`
          : '';

        const domainStr = breachContext.domain ? ` (Domain: ${breachContext.domain})` : '';
        
        const message = `Please help me resolve this ${breachContext.severity} severity vulnerability: ${breachContext.breachName}${domainStr}.${dataClassesStr} Provide step-by-step remediation instructions and security best practices.`;

        sendMessageMutation.mutate({
          conversationId: currentConversationId || undefined,
          message,
        });

        toast({
          title: "AI Assistant Activated",
          description: "Analyzing breach and generating remediation steps...",
        });
      } catch (error) {
        console.error("Failed to parse breach context:", error);
        sessionStorage.removeItem('breachContext');
      }
    }
  }, [breachContextProcessed, currentConversationId, sendMessageMutation, toast]);

  return (
    <div className="relative h-full flex">
      {/* Sidebar Toggle Button - Mobile/Desktop */}
      <Button
        size="icon"
        variant="outline"
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed top-20 left-4 z-50"
        data-testid="button-toggle-sidebar"
      >
        {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Conversations Sidebar - Overlay */}
      <AnimatePresence>
        {showSidebar && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowSidebar(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 z-50"
            >
              <Card className="h-full flex flex-col rounded-none border-r">
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4 border-b">
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <Button
                    size="sm"
                    onClick={handleNewConversation}
                    data-testid="button-new-conversation"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-full px-4">
                    {conversations.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">
                        No conversations yet. Start a new one!
                      </p>
                    ) : (
                      <div className="space-y-2 pb-4 pt-4">
                        {conversations.map((conv) => (
                          <button
                            key={conv.id}
                            onClick={() => {
                              setCurrentConversationId(conv.id);
                              setShowSidebar(false);
                            }}
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area - Centered */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl h-full flex flex-col">
          {/* Chat Header */}
          <Card className="mb-4">
            <CardHeader className="py-4">
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
          </Card>

          {/* Messages Area */}
          <Card className="flex-1 flex flex-col min-h-0">
            <div 
              className="flex-1 overflow-y-auto p-6"
              onScroll={handleScroll}
              ref={scrollAreaRef}
            >
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
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex gap-3 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Shield className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[75%] rounded-lg p-4 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </p>
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
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-accent">
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </motion.div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Shield className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-4">
                        <TypingIndicator />
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Fixed Input Area at Bottom */}
            <div className="border-t p-4 bg-card">
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
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-24 right-8 z-30"
          >
            <Button
              size="icon"
              onClick={() => scrollToBottom("smooth")}
              className="rounded-full w-12 h-12 shadow-lg"
              data-testid="button-scroll-to-bottom"
            >
              <ArrowDown className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
