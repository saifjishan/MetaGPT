#!/bin/bash

# Start the backend server
echo "Starting MetaGPT backend server..."
cd server
python app.py &
BACKEND_PID=$!
cd ..

# Wait for the backend to start
sleep 2

# Start the frontend development server
echo "Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

# Function to handle script termination
function cleanup {
  echo "Shutting down servers..."
  kill $FRONTEND_PID
  kill $BACKEND_PID
  exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

# Keep the script running
echo "Both servers are running. Press Ctrl+C to stop."
wait