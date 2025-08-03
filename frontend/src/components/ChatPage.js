import React, { useState, useRef, useEffect } from 'react';
import { Send, User, MessageSquare, ChevronDown, Menu, X, Image as ImageIcon, Type } from 'lucide-react';
import AccountPanel from './AccountPanel';
import axios from 'axios';
import TaskDescriptionPanel from './TaskDescriptionPanel';

const ChatPage = ({ user, onLogout }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedAI, setSelectedAI] = useState('GPT-4o');
  const [isAIDropdownOpen, setIsAIDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAccountPanelOpen, setIsAccountPanelOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const [messageType, setMessageType] = useState('text'); // 'text' or 'image'
  const messagesEndRef = useRef(null);
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false); // Fixed: using setIsDescriptionVisible

  const [submittedTasks, setSubmittedTasks] = useState(() => {
    const stored = localStorage.getItem('submittedTasks');
    return stored ? JSON.parse(stored) : [];
  });

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

  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("https://hmi-ai-prompting.onrender.com/tasks");
        const tasks = res.data;

        const enrichedTasks = tasks.map(task => ({
          ...task,
          messages: [],
        }));

        setChats(enrichedTasks);
      } catch (err) {
        console.error("Failed to load tasks:", err);
      }
    };

    fetchTasks();
  }, []);

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

  const callPuterAI = async (messages) => {
    if (!window.puter || !puterReady) {
      throw new Error('PuterJS is not ready yet');
    }

    try {
      // If it's a string (old format), convert to array
      const messageArray = typeof messages === 'string' 
        ? [{ role: 'user', content: messages }]
        : messages;

      // Pass through any options you need, e.g. model, temperature, max_tokens
      const response = await window.puter.ai.chat(messageArray, {
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

  const callPuterImageGeneration = async (prompt) => {
    if (!window.puter || !puterReady) {
      throw new Error('PuterJS is not ready yet');
    }

    try {
      // Use puter.ai.txt2img for DALL-E 3 image generation
      const imageElement = await window.puter.ai.txt2img(prompt);
      
      // Extract the image URL from the element
      if (imageElement && imageElement.src) {
        return imageElement.src;
      } else if (imageElement && typeof imageElement === 'string') {
        return imageElement;
      }
      
      throw new Error('Invalid image response from PuterJS');
    } catch (error) {
      console.error('PuterJS image generation failed:', error);
      throw error;
    }
  };

  const sendMessage = async (content) => {
    if (!content.trim() || !selectedChat) return;

    const newMessage = {
      id: Date.now(),
      content,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: messageType
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

    let aiResponse;

    try {
      let aiResponseContent = '';

      if (selectedAI === 'GPT-4o' && puterReady) {
        if (messageType === 'image') {
          // Generate image using PuterJS DALL-E 3
          const imageUrl = await callPuterImageGeneration(content);
          aiResponse = {
            id: Date.now() + 1,
            content: imageUrl,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            model: selectedAI,
            type: 'image'
          };
        } else {
            // Build conversation history for context
          const conversationHistory = selectedChat.messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }));
          
          // Add current message
          conversationHistory.push({
            role: 'user',
            content: content
          });

          const aiResponseContent = await callPuterAI(conversationHistory);
          aiResponse = {
            id: Date.now() + 1,
            content: aiResponseContent,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            model: selectedAI,
            type: 'text'
          };
        }
      } else {
        const responseContent = messageType === 'image' 
          ? 'https://via.placeholder.com/512x512/4F46E5/FFFFFF?text=AI+Generated+Image+Placeholder'
          : `This is a simulated response from ${selectedAI}. In a real implementation, this would connect to your chosen AI API.`;
        
        aiResponse = {
          id: Date.now() + 1,
          content: responseContent,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          model: selectedAI,
          type: messageType === 'image' ? 'image' : 'text'
        };
      }
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
      // Prepare interaction + message payload
      console.log(storedUser);
      const interactionPayload = {
        participant_id: storedUser.participant_id, // or user.id if available
        task_id: selectedChat.id,   // assuming task.id is chat.id
        ai_tool: selectedAI,
        messages: [
          {
            sender: 'user',
            content,
            timestamp: newMessage.timestamp,
          },
          {
            sender: 'ai',
            content: aiResponseContent,
            timestamp: new Date().toISOString(),
          }
        ]
      };

      // Send to backend
      try {
        await fetch('https://hmi-ai-prompting.onrender.com/store-interaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(interactionPayload)
        });
      } catch (err) {
        console.error("Failed to store interaction", err);
      }

    } catch (error) {
      console.error('Error getting AI response:', error);

      // Add error message
      const errorResponse = {
        id: Date.now() + 1,
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        model: selectedAI,
        isError: true,
        type: 'text'
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

  const handleSubmitTask = async () => {
    if (!selectedChat || !selectedChat.id || submittedTasks.includes(selectedChat.id)) return;

    try {
      // Optional: Send submission info to server
      await axios.post('https://hmi-ai-prompting.onrender.com/submit-task', {
        participant_id: storedUser.participant_id,
        task_id: selectedChat.id,
      });

      const updated = [...submittedTasks, selectedChat.id];
      setSubmittedTasks(updated);
      localStorage.setItem('submittedTasks', JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to submit task", error);
    }
  };

  const handleSendMessage = () => {
    sendMessage(message);
    setMessage('');
  };

  const renderMessage = (msg) => {
    if (msg.type === 'image') {
      if (msg.sender === 'user') {
        return (
          <div className="flex items-center space-x-2">
            <ImageIcon size={16} />
            <span>Image request: {msg.content}</span>
          </div>
        );
      } else {
        return (
          <div className="space-y-2">
            <img 
              src={msg.content} 
              alt="AI Generated Image" 
              className="max-w-full h-auto rounded-lg border border-gray-200"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div style={{display: 'none'}} className="text-red-600 text-sm">
              Failed to load image. URL: {msg.content}
            </div>
          </div>
        );
      }
    }
    return <div className="whitespace-pre-wrap">{msg.content}</div>;
  };

  return (
    <div className="flex h-screen bg-gray-100 relative select-none">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-0'
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
              {puterReady ? '🟢 PuterJS Ready (Text + Images)' : '🟡 Loading PuterJS...'}
            </span>
          </div>
        </div>

        <div className="overflow-y-auto h-full pb-20">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
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

      {/* Task Description Panel - Fixed positioning */}
      {isDescriptionVisible && selectedChat && (
        <TaskDescriptionPanel 
          description={selectedChat.description} 
          isOpen={isDescriptionVisible}
          onClose={() => setIsDescriptionVisible(false)} 
        />
      )}

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
                <h1 className="text-xl font-semibold text-gray-800 relative">
                  {selectedChat?.title || 'Select a Task'}
                </h1>
                {selectedChat && (
                  <p className="text-sm text-gray-600 mt-1">{selectedChat.task}</p>
                )}
              </div>
              {/* Fixed Show Description Button */}
              {selectedChat && (
                <div>
                  <button
                    onClick={() => setIsDescriptionVisible(!isDescriptionVisible)}  
                    className="px-4 py-2 hover:bg-sky-700 rounded-md bg-sky-600 transition-colors"
                  >
                   <span className="text-white">
                     {isDescriptionVisible ? 'Hide Description' : 'Show Description'}
                   </span> 
                  </button>
                </div>
              )}
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
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${selectedAI === ai ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
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
                  <div className={`max-w-[70%] rounded-lg px-4 py-2 ${msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : msg.isError
                      ? 'bg-red-50 border border-red-200 text-red-800'
                      : 'bg-white border border-gray-200 text-gray-800'
                    }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className={`text-xs mt-1 flex items-center justify-between ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                      <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      {msg.sender === 'ai' && msg.model && (
                        <span className="ml-2 text-xs flex items-center space-x-1">
                          <span>{msg.model}</span>
                          {msg.type === 'image' && <ImageIcon size={12} />}
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
                        {messageType === 'image' 
                          ? `${selectedAI} is generating image...`
                          : `${selectedAI} is thinking...`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              {/* Message Type Toggle */}
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-sm text-gray-600">Mode:</span>
                <button
                  onClick={() => setMessageType('text')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
                    messageType === 'text' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Type size={14} />
                  <span>Text</span>
                </button>
                <button
                  onClick={() => setMessageType('image')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
                    messageType === 'image' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } ${selectedAI !== 'GPT-4o' || !puterReady ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={selectedAI !== 'GPT-4o' || !puterReady}
                  title={selectedAI !== 'GPT-4o' ? 'Image generation only available with GPT-4o' : !puterReady ? 'Waiting for PuterJS to load' : ''}
                >
                  <ImageIcon size={14} />
                  <span>Image</span>
                  {selectedAI === 'GPT-4o' && puterReady && (
                    <span className="text-xs bg-white bg-opacity-20 px-1 rounded">DALL-E 3</span>
                  )}
                </button>
              </div>

              <div className="flex space-x-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    messageType === 'image'
                      ? selectedAI === 'GPT-4o' && puterReady
                        ? "Describe the image you want to generate..."
                        : "Image generation only available with GPT-4o"
                      : selectedAI === 'GPT-4o' && !puterReady 
                        ? 'Waiting for PuterJS to load...' 
                        : `Type your message to ${selectedAI}...`
                  }
                  disabled={isLoading || (selectedAI === 'GPT-4o' && !puterReady) || (messageType === 'image' && selectedAI !== 'GPT-4o')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={!message.trim() || isLoading || (selectedAI === 'GPT-4o' && !puterReady) || (messageType === 'image' && selectedAI !== 'GPT-4o')}
                  onClick={handleSendMessage}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : messageType === 'image' ? (
                    <ImageIcon size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>

              {/* Status message */}
              <div className="mt-2 text-xs text-gray-500">
                {selectedAI === 'GPT-4o' && puterReady && (
                  <span className="text-green-600">
                    ✅ Ready for {messageType === 'image' ? 'DALL-E 3 image generation' : 'GPT-4o text chat'}
                  </span>
                )}
                {selectedAI === 'GPT-4o' && !puterReady && (
                  <span className="text-yellow-600">⏳ Loading PuterJS for GPT-4o access...</span>
                )}
                {selectedAI !== 'GPT-4o' && messageType === 'image' && (
                  <span className="text-orange-600">⚠️ Image generation only available with GPT-4o</span>
                )}
                {selectedAI !== 'GPT-4o' && messageType === 'text' && (
                  <span className="text-blue-600">ℹ️ Using simulated {selectedAI} responses</span>
                )}
              </div>
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
                    ? '✅ GPT-4o + DALL-E 3 ready via PuterJS' 
                    : '⏳ Loading PuterJS...'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Task Submit Button */}
        <div className="border-t border-gray-200 p-4 pt-2">
          {submittedTasks.includes(selectedChat?.id) ? (
            <div className="text-green-600 text-sm">✅ You have already submitted this task.</div>
          ) : (
            <button
              onClick={handleSubmitTask}
              className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ✅ Submit Task
            </button>
          )}
        </div>
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