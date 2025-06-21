import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

const conversations = [
  { id: 1, title: 'Ask the AI to write a day plan for you' },
  { id: 2, title: 'Discuss your resume with the AI' },
  { id: 3, title: 'Help with debugging a React app' },
];

const aiModels = [
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'gpt-3.5', name: 'GPT-3.5' },
  { id: 'custom-ai', name: 'Custom AI' },
];

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(conversations[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedAI, setSelectedAI] = useState(aiModels[0].id);

  const handleSend = () => {
  if (!input.trim()) return;

  const messageText = input;
  const userMessage = { sender: 'user', text: messageText };
  setMessages((prev) => [...prev, userMessage]);
  setInput('');

  setTimeout(() => {
    const aiResponse = {
      sender: 'ai',
      text: `(${selectedAI.toUpperCase()}) Mock response to: \"${messageText}\"`,
    };
    setMessages((prev) => [...prev, aiResponse]);
  }, 1000);
};

  return (
    <div className="grid grid-cols-12 h-screen">
      {/* Sidebar */}
      <aside className="col-span-3 border-r bg-gray-100 p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Chats</h2>
        <ul>
          {conversations.map((chat) => (
            <li
              key={chat.id}
              className={`p-2 rounded cursor-pointer mb-2 hover:bg-gray-200 ${
                chat.id === activeChat.id ? 'bg-gray-300 font-bold' : ''
              }`}
              onClick={() => {
                setActiveChat(chat);
                setMessages([]);
              }}
            >
              {chat.title}
            </li>
          ))}
        </ul>
      </aside>

      {/* Chat Area */}
      <main className="col-span-9 flex flex-col">
        <div className="sticky top-0 bg-white z-10 border-b p-4 shadow-sm flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{activeChat.title}</h1>
          <Select value={selectedAI} onValueChange={setSelectedAI}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select AI" />
            </SelectTrigger>
            <SelectContent>
              {aiModels.map((ai) => (
                <SelectItem key={ai.id} value={ai.id}>{ai.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded max-w-[70%] ${
                msg.sender === 'user' ? 'bg-blue-100 self-end ml-auto' : 'bg-gray-200'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </ScrollArea>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 border-t flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit">Send</Button>
        </form>
      </main>
    </div>
  );
}
