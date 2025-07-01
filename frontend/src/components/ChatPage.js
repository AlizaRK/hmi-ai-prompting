import React, { useState, useRef, useEffect } from 'react';
import { Send, User, MessageSquare, ChevronDown, Menu, X, Loader2 } from 'lucide-react';
import AccountPanel from './AccountPanel';
import apiService from '../services/api';

const ChatPage = ({ user, onLogout }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedAI, setSelectedAI] = useState('Claude');
  const [isAIDropdownOpen, setIsAIDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAccountPanelOpen, setIsAccountPanelOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Sample chat topics for the study
  const chatTopics = [
    {
      id: 1,
      title: "Vacation Planning",
      task: "Ask AI to generate your ideal vacation picture",
      messages: []
    },
    {
      id: 2,
      title: "Creative Writing",
      task: "Ask AI to help you write a short story about friendship",
      messages: []
    },
    {
      id: 3,
      title: "Recipe Creation",
      task: "Ask AI to create a unique recipe using your favorite ingredients",
      messages: []
    },
    {
      id: 4,
      title: "Problem Solving",
      task: "Ask AI to help you solve a daily life challenge",
      messages: []
    },
    {
      id: 5,
      title: "Learning Assistant",
      task: "Ask AI to explain a complex concept in simple terms",
      messages: []
    }
  ];

  const [chats, setChats] = useState(chatTopics);

  const aiOptions = ['Claude', 'GPT-4', 'Gemini', 'PaLM'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  useEffect(() => {
    if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
    }
  }, [chats]);

  // Load conversation history when chat is selected
  useEffect(() => {
    if (selectedChat && user) {
      loadConversationHistory(selectedChat.id);
    }
  }, [selectedChat, user]);

  const loadConversationHistory = async (taskId) => {
    try {
      // For now, we'll use a simple participant ID based on the user data
      // In a real app, you'd have proper user authentication with IDs
      const participantId = user.participantId || 1;
      
      const conversation = await apiService.getConversation(participantId, taskId);
      
      if (conversation.messages && conversation.messages.length > 0) {
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === taskId 
              ? { ...chat, messages: conversation.messages }
              : chat
          )
        );
        
        if (selectedChat && selectedChat.id === taskId) {
          setSelectedChat(prev => ({
            ...prev,
            messages: conversation.messages
          }));
        }
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim() || !selectedChat || isLoading) return;

    setIsLoading(true);
    setError('');

    const newUserMessage = {
      id: Date.now(),
      content,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, newUserMessage]
    };
    
    setSelectedChat(updatedChat);
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === selectedChat.id ? updatedChat : chat
      )
    );

    try {
      // Send message to API
      const response = await apiService.sendMessage({
        message: content,
        ai_model: selectedAI,
        participant_id: user.participantId || 1,
        task_id: selectedChat.id
      });

      const aiMessage = {
        id: Date.now() + 1,
        content: response.response,
        sender: 'ai',
        ai_model: response.model,
        timestamp: response.timestamp
      };

      // Add AI response
      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiMessage]
      };

      setSelectedChat(finalChat);
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChat.id ? finalChat : chat
        )
      );

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      
      // Remove the user message if API call failed
      setSelectedChat(selectedChat);
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChat.id ? selectedChat : chat
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    sendMessage(message);
    setMessage('');
  };

  const clearError = () => setError('');

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isSidebarOpen ? 'w-80' : 'w-0'
      } overflow-hidden relative`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Study Tasks</h2>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Welcome, {user?.fullName}
          </div>
        </div>
        
        <div className="overflow-y-auto h-full pb-20">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <MessageSquare size={20} className="text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{chat.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{chat.task}</p>
                  {chat.messages.length > 0 && (
                    <div className="text-xs text-blue-600 mt-1">
                      {chat.messages.length} messages
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Account Icon - Fixed at bottom left of sidebar */}
        <div className="absolute bottom-4 left-4">
          <button
            onClick={() => setIsAccountPanelOpen(!isAccountPanelOpen)}
            className="flex items-center space-x-2 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
          </button>
        </div>
      </div>

      {/* Account Panel */}
      <AccountPanel 
        user={user}
        onLogout={onLogout}
        isOpen={isAccountPanelOpen}
        onClose={() => setIsAccountPanelOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <Menu size={20} />
                </button>
              )}
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  {selectedChat?.title || 'Select a Task'}
                </h1>
                {selectedChat && (
                  <p className="text-sm text-gray-600 mt-1">{selectedChat.task}</p>
                )}
              </div>
            </div>
            
            {/* AI Selection Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAIDropdownOpen(!isAIDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <span className="text-sm font-medium">{selectedAI}</span>
                <ChevronDown size={16} />
              </button>
              
              {isAIDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {aiOptions.map((ai) => (
                    <button
                      key={ai}
                      onClick={() => {
                        setSelectedAI(ai);
                        setIsAIDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        selectedAI === ai ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      {ai}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mt-4">
            <div className="flex">
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Messages Area */}
        {selectedChat ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className={`text-xs mt-1 flex items-center justify-between ${
                      msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      {msg.ai_model && (
                        <span className="ml-2 font-medium">{msg.ai_model}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin text-gray-500" />
                    <span className="text-gray-500 text-sm">
                      {selectedAI} is thinking...
                    </span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={!message.trim() || isLoading}
                  onClick={handleSendMessage}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium mb-2">Welcome to the Study</h3>
              <p>Select a task from the sidebar to begin</p>
            </div>
          </div>
        )}
      </div>

      {/* Account Icon for when sidebar is closed */}
      {!isSidebarOpen && (
        <div className="absolute bottom-4 left-4 z-40">
          <button
            onClick={() => setIsAccountPanelOpen(!isAccountPanelOpen)}
            className="flex items-center space-x-2 p-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow-lg transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatPage;