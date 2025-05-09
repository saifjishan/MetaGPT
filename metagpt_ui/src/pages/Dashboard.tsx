import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AgentCard from '../components/ui/AgentCard';
import ChatMessage from '../components/ui/ChatMessage';

// Mock data for agents
const agentData = [
  { id: 1, name: 'Product Manager', role: 'PM', color: 'blue', avatar: '👨‍💼' },
  { id: 2, name: 'Architect', role: 'Architect', color: 'purple', avatar: '👩‍💻' },
  { id: 3, name: 'Project Manager', role: 'PJM', color: 'green', avatar: '📊' },
  { id: 4, name: 'Engineer 1', role: 'ENG', color: 'red', avatar: '👨‍🔧' },
  { id: 5, name: 'Engineer 2', role: 'ENG', color: 'red', avatar: '👩‍🔧' },
  { id: 6, name: 'QA Engineer', role: 'QA', color: 'yellow', avatar: '🔍' },
];

const Dashboard = () => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgent, setActiveAgent] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    // Add user message
    setMessages([...messages, { role: 'user', content: prompt }]);
    setPrompt('');
    setIsProcessing(true);

    // Simulate agent processing
    setTimeout(() => {
      simulateAgentProcessing();
    }, 1000);
  };

  const simulateAgentProcessing = () => {
    // Simulate Product Manager starting
    setActiveAgent(1);
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        agent: 'Product Manager',
        content: "I'll analyze the requirements and create a PRD for this project.",
        thinking: "Need to understand user needs, market analysis, and define key features."
      }]);
      
      // Simulate Architect taking over
      setTimeout(() => {
        setActiveAgent(2);
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            agent: 'Architect',
            content: "Based on the PRD, I'll design the system architecture with appropriate components and data flow.",
            thinking: "Considering scalability, performance, and security requirements. Need to define API interfaces and data models."
          }]);
          
          // Simulate Project Manager
          setTimeout(() => {
            setActiveAgent(3);
            setTimeout(() => {
              setMessages(prev => [...prev, { 
                role: 'assistant', 
                agent: 'Project Manager',
                content: "I'll create a project plan with tasks, dependencies, and timeline estimates.",
                thinking: "Breaking down the work into manageable tasks, assigning resources, and setting milestones."
              }]);
              
              // Simulate Engineers working
              setTimeout(() => {
                setActiveAgent(4);
                setTimeout(() => {
                  setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    agent: 'Engineer 1',
                    content: "I'll implement the core functionality based on the architecture design.",
                    thinking: "Planning to use React for frontend, Node.js for backend, and MongoDB for database."
                  }]);
                  
                  setTimeout(() => {
                    setActiveAgent(5);
                    setTimeout(() => {
                      setMessages(prev => [...prev, { 
                        role: 'assistant', 
                        agent: 'Engineer 2',
                        content: "I'll work on the API endpoints and database schema.",
                        thinking: "Designing RESTful API with proper error handling and data validation."
                      }]);
                      
                      // Simulate QA Engineer
                      setTimeout(() => {
                        setActiveAgent(6);
                        setTimeout(() => {
                          setMessages(prev => [...prev, { 
                            role: 'assistant', 
                            agent: 'QA Engineer',
                            content: "I'll create test cases and perform testing to ensure quality.",
                            thinking: "Planning unit tests, integration tests, and end-to-end tests to verify functionality."
                          }]);
                          
                          // Finish processing
                          setTimeout(() => {
                            setActiveAgent(null);
                            setIsProcessing(false);
                            
                            // Final summary message
                            setMessages(prev => [...prev, { 
                              role: 'system', 
                              content: "Project planning complete! The team has analyzed requirements, designed architecture, created a project plan, and assigned development tasks. Ready to begin implementation."
                            }]);
                          }, 2000);
                        }, 1000);
                      }, 1000);
                    }, 1000);
                  }, 2000);
                }, 1000);
              }, 1000);
            }, 1000);
          }, 1000);
        }, 1000);
      }, 2000);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main chat area */}
        <div className="lg:col-span-2 glass rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">MetaGPT Chat</h2>
            <p className="text-gray-400 text-sm">Interact with the multi-agent system</p>
          </div>
          
          <div className="h-[calc(100vh-300px)] overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-4"
                >
                  <span className="text-5xl">✨</span>
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-xl font-medium text-white mb-2"
                >
                  Welcome to MetaGPT
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-gray-400 max-w-md"
                >
                  Describe what you want to build, and our team of AI agents will collaborate to make it happen.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md"
                >
                  <button
                    onClick={() => setPrompt("Create a todo list web app with React")}
                    className="p-2 text-left text-sm text-gray-300 rounded-md hover:bg-dark-lighter border border-gray-700 transition-colors"
                  >
                    "Create a todo list web app with React"
                  </button>
                  <button
                    onClick={() => setPrompt("Build a weather app that shows 5-day forecast")}
                    className="p-2 text-left text-sm text-gray-300 rounded-md hover:bg-dark-lighter border border-gray-700 transition-colors"
                  >
                    "Build a weather app that shows 5-day forecast"
                  </button>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <ChatMessage key={index} message={message} />
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-700">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isProcessing}
                placeholder={isProcessing ? "Processing..." : "Describe what you want to build..."}
                className="flex-1 px-4 py-2 bg-dark-lighter text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isProcessing || !prompt.trim()}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isProcessing || !prompt.trim()
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 glow-blue'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing
                  </span>
                ) : (
                  'Send'
                )}
              </button>
            </form>
          </div>
        </div>
        
        {/* Agents panel */}
        <div className="glass rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">Agents</h2>
            <p className="text-gray-400 text-sm">Team of specialized AI agents</p>
          </div>
          
          <div className="p-4 grid grid-cols-2 gap-4">
            {agentData.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                isActive={activeAgent === agent.id}
              />
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Current Status</h3>
            <div className="p-3 bg-dark-lighter rounded-md">
              {isProcessing ? (
                <div className="flex items-center text-white">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span>
                    {activeAgent 
                      ? `${agentData.find(a => a.id === activeAgent)?.name} is working...` 
                      : 'Processing...'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-gray-400">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
                  <span>Idle - Waiting for input</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;