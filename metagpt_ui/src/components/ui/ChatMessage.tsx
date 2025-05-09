import { useState } from 'react';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  message: {
    role: string;
    content: string;
    agent?: string;
    thinking?: string;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const [showThinking, setShowThinking] = useState(false);

  const getAgentColor = (agent?: string) => {
    switch (agent) {
      case 'Product Manager':
        return 'border-blue-500 bg-blue-500/10';
      case 'Architect':
        return 'border-purple-500 bg-purple-500/10';
      case 'Project Manager':
        return 'border-green-500 bg-green-500/10';
      case 'Engineer 1':
      case 'Engineer 2':
        return 'border-red-500 bg-red-500/10';
      case 'QA Engineer':
        return 'border-yellow-500 bg-yellow-500/10';
      default:
        return 'border-gray-700';
    }
  };

  const getAgentIcon = (agent?: string) => {
    switch (agent) {
      case 'Product Manager':
        return '👨‍💼';
      case 'Architect':
        return '👩‍💻';
      case 'Project Manager':
        return '📊';
      case 'Engineer 1':
        return '👨‍🔧';
      case 'Engineer 2':
        return '👩‍🔧';
      case 'QA Engineer':
        return '🔍';
      default:
        return '🤖';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-lg ${
        message.role === 'user'
          ? 'bg-dark-lighter border border-gray-700'
          : message.role === 'system'
          ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/50'
          : `border-l-4 ${getAgentColor(message.agent)}`
      }`}
    >
      {message.role === 'assistant' && message.agent && (
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm bg-dark-lighter">
            {getAgentIcon(message.agent)}
          </div>
          <span className="ml-2 text-sm font-medium text-gray-300">{message.agent}</span>
          
          {message.thinking && (
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="ml-auto text-xs text-gray-400 hover:text-white transition-colors"
            >
              {showThinking ? 'Hide thinking' : 'Show thinking'}
            </button>
          )}
        </div>
      )}
      
      {message.role === 'system' && (
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm bg-dark-lighter">
            ℹ️
          </div>
          <span className="ml-2 text-sm font-medium text-gray-300">System</span>
        </div>
      )}
      
      <div className="text-white whitespace-pre-wrap">{message.content}</div>
      
      {message.thinking && showThinking && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-3 pt-3 border-t border-gray-700"
        >
          <div className="flex items-start">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-gray-700 mt-0.5">
              💭
            </div>
            <div className="ml-2">
              <h4 className="text-xs font-medium text-gray-400 mb-1">Thinking Process</h4>
              <p className="text-sm text-gray-300">{message.thinking}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChatMessage;