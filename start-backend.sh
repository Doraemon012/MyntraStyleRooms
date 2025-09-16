#!/bin/bash

# Script to start the backend server
echo "🚀 Starting MyntraStyleRooms Backend Server..."

# Navigate to backend directory
cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "🌟 Starting server on http://localhost:5000"
npm start
