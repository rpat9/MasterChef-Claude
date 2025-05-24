# MasterChef Claude

A full-stack React and Tailwind-based web application that generates personalized recipes based on your available ingredients using Claude AI.

## Features

### 🧑‍🍳 Recipe Generation

- Add ingredients you have on hand
- Generate custom recipes using Claude AI
- Smart ingredient validation and duplicate prevention
- Progress tracking (minimum 5 ingredients required)

### 👤 User Authentication

- Firebase Authentication integration
- Sign up/Sign in functionality
- User-specific recipe saving
- Secure user sessions

### 💾 Recipe Management

- Save generated recipes to your personal collection
- Add personal notes to saved recipes
- Mark recipes as favorites
- View full recipe details with markdown rendering
- Delete unwanted recipes

### 🎨 User Experience

- Dark/Light theme toggle
- Responsive design for mobile and desktop
- Loading states and visual feedback
- Clean, modern interface

### 🏗️ Technical Architecture

- **Frontend**: React with Vite, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: Firebase Firestore
- **AI Integration**: Claude API via Anthropic SDK
- **Authentication**: Firebase Auth
- **Deployment**: Docker and AWS

## Getting Started

1. Set up environment variables for Firebase configuration and your unique Claude API key
2. Install dependencies: `npm install`
3. Run backend: `npm start` (port 3001)
4. Run frontend: `npm run dev` (port 5173)

## Docker Support

Both frontend and backend include Dockerfiles for containerized deployment with proper environment variable handling.
