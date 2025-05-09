import { motion } from 'framer-motion';

interface AgentProps {
  agent: {
    id: number;
    name: string;
    role: string;
    color: string;
    avatar: string;
  };
  isActive: boolean;
}

const AgentCard: React.FC<AgentProps> = ({ agent, isActive }) => {
  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500';
      case 'red':
        return 'bg-red-500';
      case 'green':
        return 'bg-green-500';
      case 'purple':
        return 'bg-purple-500';
      case 'yellow':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getGlowClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'glow-blue';
      case 'red':
        return 'glow-red';
      case 'green':
        return 'shadow-[0_0_10px_rgba(74,222,128,0.5)]';
      case 'purple':
        return 'shadow-[0_0_10px_rgba(167,139,250,0.5)]';
      case 'yellow':
        return 'shadow-[0_0_10px_rgba(251,191,36,0.5)]';
      default:
        return '';
    }
  };

  return (
    <motion.div
      className={`agent-card p-3 rounded-lg ${
        isActive 
          ? `glass ${getGlowClass(agent.color)} agent-active` 
          : 'bg-dark-lighter hover:bg-dark-light'
      } transition-all duration-300`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${getColorClass(agent.color)}`}>
          {agent.avatar}
        </div>
        <div className="ml-3">
          <h3 className="text-white font-medium">{agent.name}</h3>
          <p className="text-xs text-gray-400">{agent.role}</p>
        </div>
      </div>
      
      {isActive && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="flex items-center text-xs text-gray-300">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="thinking-dots">Thinking</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AgentCard;