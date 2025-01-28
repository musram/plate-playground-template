'use client';

import React, { useState, useRef } from 'react';
import { useChat } from '@/hooks/use-chat';
import { Square, Minimize2, Maximize2 } from 'lucide-react';
import { SettingsDialog } from '@/components/editor/settings';

export function AiChatWindow() {
  const [input, setInput] = useState('');
  const [width, setWidth] = useState(320);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { messages, loading, sendMessage, stopGeneration } = useChat();
  
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleStopGeneration = () => {
    stopGeneration();
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    isResizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';

    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      
      const delta = startXRef.current - e.clientX;
      const newWidth = Math.max(320, Math.min(800, startWidthRef.current + delta));
      setWidth(newWidth);
    };

    const handleResizeEnd = () => {
      isResizingRef.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };

    window.addEventListener('mousemove', handleResizeMove);
    window.addEventListener('mouseup', handleResizeEnd);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div 
      className={`fixed transition-all duration-300 ease-in-out ${
        isCollapsed 
          ? 'bottom-4 right-4 w-auto'
          : 'top-16 bottom-4 right-4 flex flex-row'
      }`}
      style={!isCollapsed ? { width: `${width}px` } : undefined}
    >
      {!isCollapsed ? (
        <>
          {/* Resize handle */}
          <div
            className="w-1 hover:w-2 bg-gray-200 hover:bg-gray-300 cursor-ew-resize transition-all"
            onMouseDown={handleResizeStart}
          />

          {/* Main chat window */}
          <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold border border-gray-300 rounded px-2 py-1 inline-block">CHAT</h3>
              <div className="flex items-center gap-2">
                <SettingsDialog />
                <button 
                  onClick={toggleCollapse}
                  className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      message.startsWith('You') 
                        ? 'bg-blue-100 text-blue-900' 
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {message}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">No messages yet</div>
              )}
            </div>

            {/* Input area */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-grow p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                {loading ? (
                  <button
                    onClick={handleStopGeneration}
                    className="px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <Square className="w-4 h-4" />
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md disabled:bg-blue-300 hover:bg-blue-600 transition-colors"
                  >
                    Send
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <button
          onClick={toggleCollapse}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
          <span>Open Chat</span>
        </button>
      )}
    </div>
  );
}

export default AiChatWindow;
