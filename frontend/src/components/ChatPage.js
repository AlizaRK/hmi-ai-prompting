import React, { useState, useRef, useEffect } from 'react';
import { Send, User, MessageSquare, ChevronDown, Menu, X, Image as ImageIcon, Type } from 'lucide-react';
import AccountPanel from './AccountPanel';
import axios from 'axios';
import TaskDescriptionPanel from './TaskDescriptionPanel';

const ChatPage = ({ user, onLogout, onEndStudy }) => {
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
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);

  const [submittedTasks, setSubmittedTasks] = useState(() => {
    const stored = localStorage.getItem('submittedTasks');
    return stored ? JSON.parse(stored) : [];
  });

  // Track image generation count per task (only for image tasks)
  const [imageGenerationCounts, setImageGenerationCounts] = useState(() => {
    const stored = sessionStorage.getItem('imageGenerationCounts');
    return stored ? JSON.parse(stored) : {};
  });

  // Check if PuterJS is ready (only needed for Claude now)
  useEffect(() => {
    const checkPuterReady = () => {
      if (window.puter) {
        setPuterReady(true);
        console.log('PuterJS is ready for Claude!');
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
        const res = await axios.get("https://api.hmi-ai-prompting.shop/tasks");
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

  // Updated AI options
  const aiOptions = ['GPT-4o', 'Claude Sonnet 4'];

  // AI configuration mapping
  const getAIConfig = (aiName) => {
    switch (aiName) {
      case 'GPT-4o':
        return {
          provider: 'openai',
          model: 'gpt-4o',
          supportsImages: true,
          requiresPuter: false // Using backend API now
        };
      case 'Claude Sonnet 4':
        return {
          provider: 'puter',
          model: 'claude-sonnet-4-20250514',
          supportsImages: false,
          requiresPuter: true
        };
      default:
        return {
          provider: 'openai',
          model: 'gpt-4o',
          supportsImages: true,
          requiresPuter: false
        };
    }
  };

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
    // Set message type based on task type when chat changes
    if (selectedChat && selectedChat.task_type === 'image') {
      setMessageType('image'); // Force image mode for image tasks
      setSelectedAI('GPT-4o'); // Auto-switch to GPT-4o for image tasks
    } else {
      setMessageType('text'); // Default to text for non-image tasks
    }
  }, [chats, selectedChat]);

  // Helper function to check if current task is image-based
  const isImageTask = () => {
    return selectedChat && selectedChat.task_type === 'image';
  };

  // Helper function to get current image count for selected task (only for image tasks)
  const getCurrentImageCount = () => {
    if (!selectedChat || !isImageTask()) return 0;
    return imageGenerationCounts[selectedChat.id] || 0;
  };

  // Helper function to check if image limit is reached (only for image tasks)
  const isImageLimitReached = () => {
    if (!isImageTask()) return false;
    return getCurrentImageCount() >= 5;
  };

  // Helper function to increment image count (only for image tasks)
  const incrementImageCount = (taskId) => {
    if (!isImageTask()) return;
    const newCounts = {
      ...imageGenerationCounts,
      [taskId]: (imageGenerationCounts[taskId] || 0) + 1
    };
    setImageGenerationCounts(newCounts);
    sessionStorage.setItem('imageGenerationCounts', JSON.stringify(newCounts));
  };

  // OpenAI API calls through backend
  const callOpenAI = async (messages, messageType) => {
    try {
      console.log('Calling OpenAI through backend:', { messages, messageType });

      if (messageType === 'image') {
        // Check image limit before making the call (only for image tasks)
        if (isImageTask() && isImageLimitReached()) {
          throw new Error('You have reached the limit of 5 images per task');
        }

        // For image generation, use the latest user message as prompt
        const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
        const prompt = buildImagePromptWithContext(lastUserMessage.content, selectedChat.messages);

        const response = await axios.post('https://api.hmi-ai-prompting.shop/openai-image', {
          prompt: prompt,
          model: 'dall-e-3'
        });

        // Increment image count after successful generation (only for image tasks)
        if (isImageTask()) {
          incrementImageCount(selectedChat.id);
        }

        return {
          content: response.data.image_url,
          type: 'image'
        };
      } else {
        // For text chat
        const response = await axios.post('https://api.hmi-ai-prompting.shop/openai-chat', {
          messages: messages,
          model: 'gpt-4o'
        });

        return {
          content: response.data.content,
          type: 'text'
        };
      }
    } catch (error) {
      console.error('OpenAI backend call failed:', error);
      throw new Error(error.response?.data?.error || error.message);
    }
  };

  // Claude API call through PuterJS (unchanged)
  const callPuterAI = async (messages) => {
    if (!window.puter || !puterReady) {
      throw new Error('PuterJS is not ready yet');
    }

    try {
      console.log('Calling Claude through PuterJS:', messages);

      const response = await window.puter.ai.chat(messages, {
        model: 'claude-sonnet-4-20250514',
        temperature: 0.7,
        max_tokens: 1000
      });

      console.log('Claude response:', response);

      // Handle different response formats from Claude
      if (response.message !== undefined) {
        if (typeof response.message === 'string') {
          return response.message;
        }
        if (typeof response.message.content === 'string') {
          return response.message.content;
        }
        if (Array.isArray(response.message.content)) {
          return response.message.content
            .filter(block => block.type === 'text')
            .map(block => block.text)
            .join('');
        }
      }

      if (typeof response.content === 'string') {
        return response.content;
      }

      if (response.choices && Array.isArray(response.choices) && response.choices[0]) {
        if (response.choices[0].message && response.choices[0].message.content) {
          return response.choices[0].message.content;
        }
      }

      return String(response);
    } catch (error) {
      console.error('PuterJS AI call failed for Claude:', error);
      throw error;
    }
  };

  // Helper function to build contextual prompt for image generation
  const buildImagePromptWithContext = (currentPrompt, conversationHistory) => {
    if (conversationHistory.length === 0) {
      return currentPrompt;
    }

    // Extract relevant context from conversation history
    const contextualInfo = [];
    
    // Look for previous image requests and descriptions
    const previousImageRequests = conversationHistory
      .filter(msg => msg.type === 'image' && msg.sender === 'user')
      .slice(-3)
      .map(msg => msg.content);

    // Look for relevant text context (style preferences, themes, etc.)
    const textContext = conversationHistory
      .filter(msg => msg.type === 'text' && msg.sender === 'user')
      .slice(-2)
      .map(msg => msg.content)
      .join(' ');

    // Build enhanced prompt with context
    let enhancedPrompt = currentPrompt;

    if (previousImageRequests.length > 0) {
      enhancedPrompt = `Building on previous image requests (${previousImageRequests.join(', ')}), create: ${currentPrompt}`;
    }

    if (textContext && textContext.length > 0) {
      enhancedPrompt += `. Consider this context: ${textContext}`;
    }

    // Limit prompt length to avoid API limits
    if (enhancedPrompt.length > 500) {
      enhancedPrompt = enhancedPrompt.substring(0, 500) + '...';
    }

    return enhancedPrompt;
  };

  const sendMessage = async (content) => {
    if (!content.trim() || !selectedChat) return;

    // For image tasks, always use image message type
    const actualMessageType = isImageTask() ? 'image' : messageType;

    // Check image limit before sending message for image generation (only for image tasks)
    if (actualMessageType === 'image' && isImageTask() && isImageLimitReached()) {
      // Add error message about limit
      const limitErrorMessage = {
        id: Date.now(),
        content: `You have reached the limit of 5 images per task. You cannot generate more images for this task.`,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        model: selectedAI,
        isError: true,
        type: 'text'
      };

      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === selectedChat.id
            ? { ...chat, messages: [...chat.messages, limitErrorMessage] }
            : chat
        )
      );

      setSelectedChat(prev => ({
        ...prev,
        messages: [...prev.messages, limitErrorMessage]
      }));
      return;
    }

    const newMessage = {
      id: Date.now(),
      content,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: actualMessageType
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
    const aiConfig = getAIConfig(selectedAI);

    try {
      let aiResponseContent = '';
      let responseType = 'text';

      if (aiConfig.provider === 'openai') {
        // Handle OpenAI through backend
        if (actualMessageType === 'image' && aiConfig.supportsImages) {
          // Build conversation history for context
          const conversationHistory = selectedChat.messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }));

          conversationHistory.push({
            role: 'user',
            content: content
          });

          const result = await callOpenAI(conversationHistory, 'image');
          aiResponseContent = result.content;
          responseType = result.type;
        } else if (actualMessageType === 'image' && !aiConfig.supportsImages) {
          // Handle image request for AI that doesn't support images
          aiResponseContent = `I'm ${selectedAI}, and I don't support image generation. However, I can help you describe what kind of image you're looking for or discuss image-related topics.`;
          responseType = 'text';
        } else {
          // Text chat with OpenAI
          const conversationHistory = selectedChat.messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }));

          conversationHistory.push({
            role: 'user',
            content: content
          });

          const result = await callOpenAI(conversationHistory, 'text');
          aiResponseContent = result.content;
          responseType = result.type;
        }
      } else if (aiConfig.provider === 'puter') {
        // Handle Claude through PuterJS
        if (actualMessageType === 'image') {
          aiResponseContent = `I'm ${selectedAI}, and I don't support image generation. However, I can help you with text-based tasks and discussions.`;
          responseType = 'text';
        } else if (puterReady) {
          // Build conversation history for context
          const conversationHistory = selectedChat.messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }));

          conversationHistory.push({
            role: 'user',
            content: content
          });

          aiResponseContent = await callPuterAI(conversationHistory);
          responseType = 'text';
        } else {
          throw new Error('PuterJS is not ready yet');
        }
      }

      aiResponse = {
        id: Date.now() + 1,
        content: aiResponseContent,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        model: selectedAI,
        type: responseType
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

      // Prepare interaction + message payload
      console.log(storedUser);
      const interactionPayload = {
        participant_id: storedUser.participant_id,
        task_id: selectedChat.id,
        ai_tool: selectedAI,
        message_type: actualMessageType,
        messages: [
          {
            sender: 'user',
            content,
            timestamp: newMessage.timestamp,
            type: actualMessageType
          },
          {
            sender: 'ai',
            content: aiResponseContent,
            timestamp: aiResponse.timestamp,
            type: aiResponse.type
          }
        ]
      };

      // Send to backend
      try {
        await fetch('https://api.hmi-ai-prompting.shop/store-interaction', {
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
      await axios.post('https://api.hmi-ai-prompting.shop/submit-task', {
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
              style={{ maxWidth: '400px', height: 'auto' }}
              onError={(e) => {
                console.error('Image failed to load:', msg.content);
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', msg.content);
              }}
            />
            <div style={{ display: 'none' }} className="text-red-600 text-sm">
              Failed to load image. URL: {msg.content}
            </div>
          </div>
        );
      }
    }
    return <div className="whitespace-pre-wrap">{msg.content}</div>;
  };

  // Helper function to get AI status
  const getAIStatus = () => {
    const aiConfig = getAIConfig(selectedAI);
    
    if (aiConfig.provider === 'openai') {
      if (isImageTask() && aiConfig.supportsImages) {
        const imageCount = getCurrentImageCount();
        if (isImageLimitReached()) {
          return { color: 'red', text: `Image limit reached (5/5) for this task with ${selectedAI} (DALL-E 3)` };
        }
        return { color: 'green', text: `Ready for context-aware image generation with ${selectedAI} (DALL-E 3) - ${imageCount}/5 images used` };
      } else if (isImageTask() && !aiConfig.supportsImages) {
        return { color: 'orange', text: `${selectedAI} doesn't support image generation` };
      } else {
        return { color: 'green', text: `Ready for ${selectedAI} text chat via OpenAI API` };
      }
    }
    
    if (aiConfig.provider === 'puter') {
      if (!puterReady) {
        return { color: 'yellow', text: 'Loading PuterJS for Claude...' };
      }
      
      if (isImageTask()) {
        return { color: 'orange', text: `${selectedAI} doesn't support image generation` };
      }
      
      return { color: 'green', text: `Ready for ${selectedAI} text chat via PuterJS` };
    }
    
    return { color: 'blue', text: `Using ${selectedAI}` };
  };

  const aiStatus = getAIStatus();
  const aiConfig = getAIConfig(selectedAI);

  return (
    <div className="flex h-screen bg-gray-100 relative select-none">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-80' : 'w-0'
        } overflow-hidden relative`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Study Tasks</h2>
            <button
              onClick={onEndStudy}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
            >
              End Study
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Welcome, {user?.fullName}. Please perform all the tasks listed below.
          </div>
          {/* Status Indicators */}
          <div className="mt-2 space-y-1 text-xs">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              🟢 GPT-4o + DALL-E 3 Ready (OpenAI API)
            </span>
            <br />
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${puterReady
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
              }`}>
              {puterReady ? '🟢 Claude Sonnet 4 Ready (PuterJS)' : '🟡 Loading Claude (PuterJS)...'}
            </span>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 pb-4">
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
                  {/* Show image count only for image tasks */}
                  {chat.task_type === 'image' && (
                    <div className="text-xs text-purple-600 mt-1">
                      Images: {imageGenerationCounts[chat.id] || 0}/5
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>        
      </div>

      {/* Task Description Panel */}
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
              {/* Show Description Button */}
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
                {aiConfig.provider === 'openai' && (
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                )}
                {aiConfig.provider === 'puter' && (
                  <span className={`w-2 h-2 rounded-full ${puterReady ? 'bg-green-500' : 'bg-yellow-500'}`} />
                )}
                <ChevronDown size={16} />
              </button>

              {isAIDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {aiOptions.filter(ai => !isImageTask() || ai === 'GPT-4o').map((ai) => {
                    const config = getAIConfig(ai);
                    return (
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
                          <div className="flex flex-col">
                            <span>{ai}</span>
                            <span className="text-xs text-gray-500">
                              {config.provider === 'openai' ? 'OpenAI API' : 'PuterJS'}
                              {!config.supportsImages ? ' - Text only' : ' - Text & Images'}
                            </span>
                          </div>
                          {config.provider === 'openai' && (
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                          )}
                          {config.provider === 'puter' && (
                            <span className={`w-2 h-2 rounded-full ${puterReady ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          )}
                        </div>
                      </button>
                    );
                  })}
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
                    {renderMessage(msg)}
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
                        {isImageTask()
                          ? `${selectedAI} is generating context-aware image...`
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
              {/* Show current mode for image tasks - no toggle, just display */}
              {isImageTask() && (
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-sm text-gray-600">Mode:</span>
                  <div className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm ${
                    aiConfig.supportsImages && !isImageLimitReached() 
                      ? 'bg-blue-600 text-white' 
                      : isImageLimitReached()
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-400 text-white'
                    }`}>
                    <ImageIcon size={14} />
                    <span>
                      {isImageLimitReached() 
                        ? 'Image limit reached (5/5)'
                        : aiConfig.supportsImages 
                        ? `Image Generation (${getCurrentImageCount()}/5)` 
                        : 'Image mode (not supported)'}
                    </span>
                    {selectedAI === 'GPT-4o' && !isImageLimitReached() && (
                      <span className="text-xs bg-white bg-opacity-20 px-1 rounded">DALL-E 3</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isImageTask()
                      ? isImageLimitReached()
                        ? 'Image limit reached (5/5) - cannot generate more images for this task'
                        : aiConfig.supportsImages
                        ? "Describe the image you want to generate (context from conversation will be included)..."
                        : `${selectedAI} doesn't support image generation. Try switching to GPT-4o for images.`
                      : aiConfig.provider === 'puter' && !puterReady
                        ? 'Waiting for PuterJS to load...'
                        : `Type your message to ${selectedAI}...`
                  }
                  disabled={isLoading || (aiConfig.provider === 'puter' && !puterReady) || (isImageTask() && (!aiConfig.supportsImages || isImageLimitReached()))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={!message.trim() || isLoading || (aiConfig.provider === 'puter' && !puterReady) || (isImageTask() && (!aiConfig.supportsImages || isImageLimitReached()))}
                  onClick={handleSendMessage}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : isImageTask() ? (
                    <ImageIcon size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>

              {/* Status message */}
              <div className="mt-2 text-xs">
                <span className={`${
                  aiStatus.color === 'green' ? 'text-green-600' :
                  aiStatus.color === 'yellow' ? 'text-yellow-600' :
                  aiStatus.color === 'orange' ? 'text-orange-600' :
                  aiStatus.color === 'red' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {aiStatus.color === 'green' ? '✅' : 
                   aiStatus.color === 'yellow' ? '⏳' :
                   aiStatus.color === 'orange' ? '⚠️' : 
                   aiStatus.color === 'red' ? '🚫' : 'ℹ️'} {aiStatus.text}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium mb-2">Welcome to the Study</h3>
              <p>Select a task from the sidebar to begin</p>
              <div className="mt-4 space-y-2 text-sm">
                <p className="text-green-600">✅ GPT-4o + DALL-E 3 ready via OpenAI API</p>
                <p className={puterReady ? 'text-green-600' : 'text-yellow-600'}>
                  {puterReady ? '✅ Claude Sonnet 4 ready via PuterJS' : '⏳ Loading Claude via PuterJS...'}
                </p>
              </div>
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
    </div>
  );
};

export default ChatPage;