import React, { useState, useRef, useEffect } from 'react';
import { Send, User, MessageSquare, ChevronDown, Menu, X } from 'lucide-react';
import AccountPanel from './AccountPanel';

const ChatPage = ({ user, onLogout }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedAI, setSelectedAI] = useState('GPT-4o');
  const [isAIDropdownOpen, setIsAIDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAccountPanelOpen, setIsAccountPanelOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const messagesEndRef = useRef(null);

  // Check if PuterJS is ready
  useEffect(() => {
    const checkPuterReady = () => {
      if (window.puter) {
        setPuterReady(true);
        console.log('PuterJS is ready!');
      } else {
        setTimeout(checkPuterReady, 100);
      }
    };
    checkPuterReady();
  }, []);

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

  const aiOptions = ['GPT-4o', 'Claude', 'Gemini', 'PaLM'];

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

const callPuterAI = async (prompt) => {
  if (!window.puter || !puterReady) {
    throw new Error('PuterJS is not ready yet');
  }

  try {
    // Pass through any options you need, e.g. model, temperature, max_tokens
    const response = await window.puter.ai.chat(prompt, {
      model: selectedAI.toLowerCase(), 
      temperature: 0.7,
      max_tokens: 1000
    });

    // Now extract the actual text from whatever shape the response has:
    if (response.message !== undefined) {
      // Claude‐style: response.message may be a string or an object
      if (typeof response.message === 'string') {
        return response.message;
      }
      if (typeof response.message.content === 'string') {
        return response.message.content;
      }
    }

    // GPT‐style: response.content is the string
    if (typeof response.content === 'string') {
      return response.content;
    }

    // Fallback: stringify the whole object
    return String(response);
  } catch (error) {
    console.error('PuterJS AI call failed:', error);
    throw error;
  }
};

  const sendMessage = async (content) => {
    if (!content.trim() || !selectedChat) return;

    const newMessage = {
      id: Date.now(),
      content,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === selectedChat.id 
          ? { ...chat, messages: [...chat.messages, newMessage] }
          : chat
      )
    );

    setSelectedChat(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    // Show loading state
    setIsLoading(true);

    try {
      let aiResponseContent = '';
      
      if (selectedAI === 'GPT-4o' && puterReady) {
        // Use real GPT-4o via PuterJS
        aiResponseContent = await callPuterAI(content);
      } else {
        // Fallback to simulated response for other AIs
        aiResponseContent = `This is a simulated response from ${selectedAI}. In a real implementation, this would connect to your chosen AI API.`;
      }

      const aiResponse = {
        id: Date.now() + 1,
        content: aiResponseContent,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        model: selectedAI
      };

      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChat.id 
            ? { ...chat, messages: [...chat.messages, aiResponse] }
            : chat
        )
      );

      setSelectedChat(prev => ({
        ...prev,
        messages: [...prev.messages, aiResponse]
      }));

    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorResponse = {
        id: Date.now() + 1,
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        model: selectedAI,
        isError: true
      };

      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChat.id 
            ? { ...chat, messages: [...chat.messages, errorResponse] }
            : chat
        )
      );

      setSelectedChat(prev => ({
        ...prev,
        messages: [...prev.messages, errorResponse]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    sendMessage(message);
    setMessage('');
  };

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
          {/* PuterJS Status Indicator */}
          <div className="mt-2 text-xs">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              puterReady 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {puterReady ? '🟢 PuterJS Ready' : '🟡 Loading PuterJS...'}
            </span>
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
                {selectedAI === 'GPT-4o' && (
                  <span className={`w-2 h-2 rounded-full ${puterReady ? 'bg-green-500' : 'bg-yellow-500'}`} />
                )}
                <ChevronDown size={16} />
              </button>
              
              {isAIDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
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
                      <div className="flex items-center justify-between">
                        <span>{ai}</span>
                        {ai === 'GPT-4o' && (
                          <span className={`w-2 h-2 rounded-full ${puterReady ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

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
                      : msg.isError
                      ? 'bg-red-50 border border-red-200 text-red-800'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className={`text-xs mt-1 flex items-center justify-between ${
                      msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      {msg.sender === 'ai' && msg.model && (
                        <span className="ml-2 text-xs">
                          {msg.model}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 max-w-[70%]">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-gray-600">
                        {selectedAI === 'GPT-4o' ? 'GPT-4o is thinking...' : `${selectedAI} is thinking...`}
                      </span>
                    </div>
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
                  placeholder={
                    selectedAI === 'GPT-4o' && !puterReady 
                      ? 'Waiting for PuterJS to load...' 
                      : `Type your message to ${selectedAI}...`
                  }
                  disabled={isLoading || (selectedAI === 'GPT-4o' && !puterReady)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={!message.trim() || isLoading || (selectedAI === 'GPT-4o' && !puterReady)}
                  onClick={handleSendMessage}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
              
              {/* Status message */}
              {selectedAI === 'GPT-4o' && (
                <div className="mt-2 text-xs text-gray-500">
                  {puterReady 
                    ? '✅ Ready to chat with GPT-4o via PuterJS' 
                    : '⏳ Loading PuterJS for GPT-4o access...'}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium mb-2">Welcome to the Study</h3>
              <p>Select a task from the sidebar to begin</p>
              {selectedAI === 'GPT-4o' && (
                <p className="mt-2 text-sm">
                  {puterReady 
                    ? '✅ GPT-4o is ready via PuterJS' 
                    : '⏳ Loading PuterJS...'}
                </p>
              )}
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