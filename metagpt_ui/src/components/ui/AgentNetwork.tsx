import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AgentVisualization from './AgentVisualization';
import socketService, { SocketEvent, Agent, AgentMessage, AgentHandover } from '../../services/socket';

interface AgentNetworkProps {
  projectId?: string;
}

const AgentNetwork: React.FC<AgentNetworkProps> = ({ projectId }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [connections, setConnections] = useState<AgentHandover[]>([]);
  const [activeAgent, setActiveAgent] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Initialize socket connection
  useEffect(() => {
    // Connect to socket server
    socketService.connect();

    // Set up event listeners
    socketService.on(SocketEvent.CONNECT, () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketService.on(SocketEvent.DISCONNECT, () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketService.on(SocketEvent.AGENT_UPDATE, (data: Agent) => {
      setAgents(prev => {
        const existing = prev.findIndex(a => a.id === data.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data;
          return updated;
        } else {
          return [...prev, data];
        }
      });
    });

    socketService.on(SocketEvent.AGENT_MESSAGE, (data: AgentMessage) => {
      setMessages(prev => [...prev, data]);
      setActiveAgent(data.agent_id);
    });

    socketService.on(SocketEvent.AGENT_THINKING, (data: AgentMessage) => {
      setMessages(prev => [...prev, data]);
      setActiveAgent(data.agent_id);
    });

    socketService.on(SocketEvent.AGENT_HANDOVER, (data: AgentHandover) => {
      setConnections(prev => [...prev, data]);
      setActiveAgent(data.to);
    });

    // Clean up on unmount
    return () => {
      socketService.off(SocketEvent.CONNECT, () => {});
      socketService.off(SocketEvent.DISCONNECT, () => {});
      socketService.off(SocketEvent.AGENT_UPDATE, () => {});
      socketService.off(SocketEvent.AGENT_MESSAGE, () => {});
      socketService.off(SocketEvent.AGENT_THINKING, () => {});
      socketService.off(SocketEvent.AGENT_HANDOVER, () => {});
      socketService.disconnect();
    };
  }, []);

  // Fetch initial data if needed
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch agents
        const agentsResponse = await fetch('/api/agents');
        const agentsData = await agentsResponse.json();
        if (agentsData.agents) {
          setAgents(Object.values(agentsData.agents));
        }

        // Fetch messages
        const messagesResponse = await fetch('/api/messages');
        const messagesData = await messagesResponse.json();
        if (messagesData.messages) {
          setMessages(messagesData.messages);
        }

        // Fetch handovers
        const handoversResponse = await fetch('/api/handovers');
        const handoversData = await handoversResponse.json();
        if (handoversData.handovers) {
          setConnections(handoversData.handovers);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    if (isConnected) {
      fetchData();
    }
  }, [isConnected]);

  // Filter connections to only show the most recent ones
  const recentConnections = connections.slice(-10);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-[400px] relative">
        <AnimatePresence>
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-10 rounded-lg"
            >
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-white text-lg">Connecting to server...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {agents.length > 0 ? (
          <AgentVisualization 
            agents={agents} 
            connections={recentConnections}
            activeAgent={activeAgent}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg border border-gray-800">
            <p className="text-gray-400 text-lg">No agents available</p>
          </div>
        )}
      </div>

      <div className="mt-4 bg-gray-900 rounded-lg p-4 border border-gray-800 max-h-[300px] overflow-y-auto">
        <h3 className="text-white text-lg font-semibold mb-2">Agent Activity</h3>
        <div className="space-y-2">
          {messages.length > 0 ? (
            messages.slice(-5).map((message, index) => (
              <div 
                key={message.id || index} 
                className={`p-3 rounded-lg ${
                  message.type === 'thinking' 
                    ? 'bg-blue-900 bg-opacity-30 border border-blue-700' 
                    : message.type === 'error'
                    ? 'bg-red-900 bg-opacity-30 border border-red-700'
                    : message.type === 'system'
                    ? 'bg-purple-900 bg-opacity-30 border border-purple-700'
                    : 'bg-gray-800 border border-gray-700'
                }`}
              >
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium">
                    {agents.find(a => a.id === message.agent_id)?.name || message.agent_id}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                  {message.type && (
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                      message.type === 'thinking' 
                        ? 'bg-blue-800 text-blue-200' 
                        : message.type === 'error'
                        ? 'bg-red-800 text-red-200'
                        : message.type === 'system'
                        ? 'bg-purple-800 text-purple-200'
                        : 'bg-green-800 text-green-200'
                    }`}>
                      {message.type}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-200">{message.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentNetwork;