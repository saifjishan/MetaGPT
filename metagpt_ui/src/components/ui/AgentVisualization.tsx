import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'thinking' | 'speaking' | 'listening';
  color: string;
}

interface Connection {
  from: string;
  to: string;
  message?: string;
  timestamp: number;
}

interface AgentVisualizationProps {
  agents: Agent[];
  connections: Connection[];
  activeAgent?: string;
}

const AgentVisualization: React.FC<AgentVisualizationProps> = ({ 
  agents, 
  connections,
  activeAgent 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Calculate positions in a circle
  const calculatePositions = () => {
    const width = svgRef.current?.clientWidth || 600;
    const height = svgRef.current?.clientHeight || 400;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    const positions: Record<string, { x: number, y: number }> = {};
    
    agents.forEach((agent, index) => {
      const angle = (index / agents.length) * 2 * Math.PI;
      positions[agent.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    
    return positions;
  };
  
  // Draw connections between agents
  const renderConnections = () => {
    const positions = calculatePositions();
    
    return connections.map((connection, index) => {
      const fromPos = positions[connection.from];
      const toPos = positions[connection.to];
      
      if (!fromPos || !toPos) return null;
      
      // Calculate control point for curved line
      const midX = (fromPos.x + toPos.x) / 2;
      const midY = (fromPos.y + toPos.y) / 2;
      const dx = toPos.x - fromPos.x;
      const dy = toPos.y - fromPos.y;
      const normalX = -dy * 0.3;
      const normalY = dx * 0.3;
      
      const controlX = midX + normalX;
      const controlY = midY + normalY;
      
      // Calculate text position
      const textX = midX + normalX * 0.7;
      const textY = midY + normalY * 0.7;
      
      // Calculate path for animation
      const path = `M ${fromPos.x} ${fromPos.y} Q ${controlX} ${controlY} ${toPos.x} ${toPos.y}`;
      
      // Find agent colors
      const fromAgent = agents.find(a => a.id === connection.from);
      const toAgent = agents.find(a => a.id === connection.to);
      
      // Create gradient for path
      const gradientId = `gradient-${index}`;
      
      return (
        <g key={`connection-${index}`}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={fromAgent?.color || '#3b82f6'} />
              <stop offset="100%" stopColor={toAgent?.color || '#ef4444'} />
            </linearGradient>
          </defs>
          
          {/* Path with gradient */}
          <path
            d={path}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.7"
          />
          
          {/* Animated dot moving along the path */}
          {connection.from === activeAgent && (
            <motion.circle
              cx={fromPos.x}
              cy={fromPos.y}
              r={5}
              fill="#ffffff"
              filter="drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))"
              initial={{ offsetDistance: "0%" }}
              animate={{ offsetDistance: "100%" }}
              transition={{ 
                duration: 1.5, 
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop"
              }}
              style={{
                offsetPath: `path('${path}')`,
              }}
            />
          )}
          
          {/* Message text */}
          {connection.message && (
            <text
              x={textX}
              y={textY}
              fill="#ffffff"
              fontSize="10"
              textAnchor="middle"
              filter="drop-shadow(0 0 2px rgba(0, 0, 0, 0.9))"
            >
              {connection.message}
            </text>
          )}
        </g>
      );
    });
  };
  
  // Render agent nodes
  const renderAgents = () => {
    const positions = calculatePositions();
    
    return agents.map((agent) => {
      const pos = positions[agent.id];
      if (!pos) return null;
      
      // Determine animation based on status
      let pulseAnimation = {};
      
      switch (agent.status) {
        case 'thinking':
          pulseAnimation = {
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
            transition: { 
              duration: 2, 
              repeat: Infinity,
              repeatType: "loop" 
            }
          };
          break;
        case 'speaking':
          pulseAnimation = {
            scale: [1, 1.15, 1],
            boxShadow: [
              '0 0 5px rgba(255, 255, 255, 0.5)',
              '0 0 15px rgba(255, 255, 255, 0.8)',
              '0 0 5px rgba(255, 255, 255, 0.5)'
            ],
            transition: { 
              duration: 1, 
              repeat: Infinity,
              repeatType: "loop" 
            }
          };
          break;
        case 'listening':
          pulseAnimation = {
            opacity: [0.7, 0.9, 0.7],
            transition: { 
              duration: 1.5, 
              repeat: Infinity,
              repeatType: "loop" 
            }
          };
          break;
        default:
          pulseAnimation = {};
      }
      
      const isActive = agent.id === activeAgent;
      
      return (
        <g key={agent.id}>
          {/* Glow effect for active agent */}
          {isActive && (
            <motion.circle
              cx={pos.x}
              cy={pos.y}
              r={35}
              fill="none"
              stroke={agent.color}
              strokeWidth="2"
              opacity="0.5"
              animate={{
                r: [35, 45, 35],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop"
              }}
            />
          )}
          
          {/* Agent circle */}
          <motion.circle
            cx={pos.x}
            cy={pos.y}
            r={30}
            fill={agent.color}
            opacity={isActive ? 1 : 0.7}
            animate={pulseAnimation}
            filter={isActive ? 
              `drop-shadow(0 0 10px ${agent.color})` : 
              `drop-shadow(0 0 5px rgba(0, 0, 0, 0.5))`
            }
          />
          
          {/* Agent name */}
          <text
            x={pos.x}
            y={pos.y}
            fill="#ffffff"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            filter="drop-shadow(0 0 2px rgba(0, 0, 0, 0.9))"
          >
            {agent.name}
          </text>
          
          {/* Agent role */}
          <text
            x={pos.x}
            y={pos.y + 15}
            fill="#ffffff"
            fontSize="10"
            textAnchor="middle"
            dominantBaseline="middle"
            opacity="0.8"
            filter="drop-shadow(0 0 2px rgba(0, 0, 0, 0.9))"
          >
            {agent.role}
          </text>
          
          {/* Status indicator */}
          <circle
            cx={pos.x + 25}
            cy={pos.y - 15}
            r={5}
            fill={
              agent.status === 'idle' ? '#9ca3af' :
              agent.status === 'thinking' ? '#3b82f6' :
              agent.status === 'speaking' ? '#22c55e' :
              '#f59e0b'
            }
            stroke="#ffffff"
            strokeWidth="1"
          />
        </g>
      );
    });
  };
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Force re-render on resize
      if (svgRef.current) {
        const temp = svgRef.current.style.display;
        svgRef.current.style.display = 'none';
        setTimeout(() => {
          if (svgRef.current) {
            svgRef.current.style.display = temp;
          }
        }, 0);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="w-full h-full min-h-[400px] bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
      <svg 
        ref={svgRef}
        className="w-full h-full"
        viewBox="0 0 600 400"
        preserveAspectRatio="xMidYMid meet"
      >
        {renderConnections()}
        {renderAgents()}
      </svg>
    </div>
  );
};

export default AgentVisualization;