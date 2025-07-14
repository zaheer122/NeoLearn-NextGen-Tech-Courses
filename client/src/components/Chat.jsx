import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Video, Calendar, ExternalLink, Send, Loader2, MessageSquareText, ArrowDown } from 'lucide-react';
import MeetScheduler from './MeetScheduler';
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const API_BASE_URL = 'http://localhost:8000';

// Helper function to convert message text with markdown-like syntax
const formatMessageText = (text) => {
  // Bold text between ** **
  const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert newlines to <br>
  return boldFormatted.replace(/\n/g, '<br>');
};

// Extract meeting link from message
const extractMeetingLink = (message) => {
  console.log("Extracting link from:", message);
  
  // Try the formatted pattern first (after HTML conversion)
  const linkMatch = message.match(/Join Meeting:<\/strong> (https:\/\/[^\s<]+)/);
  if (linkMatch && linkMatch[1]) {
    console.log("Found link (format 1):", linkMatch[1]);
    return linkMatch[1];
  }
  
  // Try the plain text pattern as fallback
  const plainMatch = message.match(/Join Meeting: (https:\/\/[^\s]+)/);
  if (plainMatch && plainMatch[1]) {
    console.log("Found link (format 2):", plainMatch[1]);
    return plainMatch[1];
  }
  
  // Last resort - just find any URL in the message
  const urlMatch = message.match(/(https:\/\/meet\.google\.com\/[a-z0-9-]+)/);
  if (urlMatch && urlMatch[1]) {
    console.log("Found link (format 3):", urlMatch[1]);
    return urlMatch[1];
  }
  
  console.warn("No meeting link found in message:", message);
  return null;
};

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const [isPending, startTransition] = useTransition();
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    // Use startTransition to prevent suspense during data fetching
    startTransition(() => {
      fetchMessages();
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  // Format date safely to prevent "Invalid Date" 
  const formatDate = (dateString) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return ""; 
      }
      
      return date.toLocaleString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
    setShowScrollButton(isScrolledUp);
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/v1/chat/messages`, {
        withCredentials: true
      });
      setMessages(response.data.messages || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch messages');
      console.error('Error fetching messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (customMessage = null, isMeetLink = false) => {
    if (!user) {
      setError('Please log in to send messages');
      return;
    }

    const messageToSend = customMessage || newMessage;
    if (!messageToSend.trim()) return;

    try {
      // Use startTransition for send message operation
      startTransition(async () => {
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/chat/send`,
          {
            message: messageToSend,
            userId: user._id,
            username: user.username || user.name,
            isMeetLink
          },
          { withCredentials: true }
        );

        // Check if response includes the message data
        if (response.data && response.data._id) {
          // Add the newly created message to the list
          setMessages(prevMessages => [...prevMessages, response.data]);
        } else {
          // Fetch all messages again to ensure the latest message is displayed
          fetchMessages();
        }
        
        if (!customMessage) {
          setNewMessage('');
        }
        setError(null);
        scrollToBottom(); // Scroll to bottom after sending a message
      });
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  const handleScheduleMeeting = (meetingDetails) => {
    const message = `📅 **Scheduled Meeting: ${meetingDetails.title}**\n\n⏰ **Time:** ${new Date(meetingDetails.startTime).toLocaleString()}\n⏱️ **Duration:** ${meetingDetails.duration} minutes\n${meetingDetails.description ? `📝 **Description:** ${meetingDetails.description}\n` : ''}\n🔗 **Join Meeting:** ${meetingDetails.meetLink}`;
    handleSendMessage(message, true);
  };

  const handleJoinMeeting = (meetLink) => {
    if (meetLink) {
      window.open(meetLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading && !isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-80 p-8">
        <Loader2 className="h-10 w-10 text-violet-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4 text-red-600 border-red-300 hover:bg-red-50"
          onClick={() => fetchMessages()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[80vh] md:h-[70vh]">
      <div 
        className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/30 space-y-4"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-slate-50 rounded-lg border border-slate-100">
            <div className="bg-violet-100 p-3 rounded-full mb-4">
              <MessageSquareText className="h-6 w-6 text-violet-600" />
            </div>
            <p className="text-slate-600 font-medium">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              // Store the meeting link for easier access
              let meetingLink = null;
              if (message.isMeetLink) {
                meetingLink = extractMeetingLink(message.message);
                console.log("Extracted meeting link:", meetingLink);
              }
              
              return (
                <div
                  key={message._id || `temp-${Date.now()}`}
                  className={`flex ${message.userId === user?._id ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm 
                    ${message.userId === user?._id 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white' 
                      : 'bg-white border border-slate-200 text-slate-800'}`
                  }>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium text-sm
                        ${message.userId === user?._id ? 'text-violet-100' : 'text-violet-700'}`
                      }>
                        {message.username}
                      </span>
                      <span className={`text-xs opacity-70
                        ${message.userId === user?._id ? 'text-violet-200' : 'text-slate-500'}`
                      }>
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                    
                    {message.isMeetLink ? (
                      <div className="space-y-3">
                        <div 
                          className={`rounded-md ${message.userId === user?._id ? 'bg-white/10' : 'bg-violet-50'} p-3`}
                          dangerouslySetInnerHTML={{ 
                            __html: formatMessageText(message.message)
                          }}
                        />
                        <div className="flex justify-end">
                          <Button 
                            onClick={() => handleJoinMeeting(meetingLink)}
                            size="sm"
                            className={`rounded-full text-xs font-medium flex items-center gap-1
                              ${message.userId === user?._id 
                                ? 'bg-white text-violet-700 hover:bg-white/90' 
                                : 'bg-violet-600 text-white hover:bg-violet-700'}`
                            }
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Join Meeting
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="break-words">{message.message}</div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {showScrollButton && (
        <div className="relative">
          <Button
            onClick={scrollToBottom}
            size="icon"
            className="absolute bottom-3 right-4 h-10 w-10 rounded-full bg-violet-600 text-white hover:bg-violet-700 shadow-lg"
            aria-label="Scroll to latest messages"
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2">
          <Input
            className="flex-1 h-12 border-slate-300 bg-slate-50 focus:ring-violet-500 focus:border-violet-500"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100"
              onClick={() => setShowScheduler(true)}
              title="Schedule Meeting"
              disabled={isPending}
            >
              <Calendar className="h-5 w-5" />
            </Button>
            
            <Button
              type="button"
              size="icon"
              className="h-12 w-12 rounded-full bg-violet-600 text-white hover:bg-violet-700"
              onClick={() => handleSendMessage()}
              disabled={isPending}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {showScheduler && (
        <Dialog open={showScheduler} onOpenChange={setShowScheduler}>
          <MeetScheduler
            onSchedule={handleScheduleMeeting}
            onClose={() => setShowScheduler(false)}
          />
        </Dialog>
      )}
    </div>
  );
};

export default Chat; 