# QuizRush - Interactive Trivia Game

A modern, real-time trivia game built with React, TypeScript, and WebSocket technology. Features both local multiplayer and online multiplayer modes with AI-generated custom questions.

## Features

### 🎮 Game Modes

- **Local (Party) Mode**: 2-4 players on one device
- **Online Multiplayer**: Real-time multiplayer with WebSocket
- **AI-Generated Questions**: Custom questions using Google's Gemini AI

### 🧠 AI-Powered Custom Questions

- Generate unlimited custom trivia questions
- Multiple categories: History, Science, Geography, Literature, Sports, Entertainment
- Adjustable difficulty levels
- Custom topic focus
- Real-time question preview

### 🏆 Game Features

- 5-minute lightning rounds
- Real-time scoring and leaderboards
- Multiple choice questions with explanations
- Beautiful, responsive UI with animations
- Sound effects and visual feedback

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd QuizRush
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## AI-Generated Questions Setup

To use the AI-generated questions feature:

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a `.env` file in the root directory:

```
VITE_GEMINI_API_KEY=your_api_key_here
```

3. Restart the development server

For detailed setup instructions, see [CUSTOM_QUESTIONS_README.md](./CUSTOM_QUESTIONS_README.md)

## Usage

### Local Mode

1. Select "Local (Party) Mode"
2. Add 2-4 players
3. Choose between standard questions or AI-generated questions
4. Start the game and enjoy!

### Online Multiplayer

1. Select "Online Multiplayer"
2. Create or join a room
3. Wait for all players to be ready
4. Start the game

### AI-Generated Questions

1. In Local Mode, click "AI-Generated Questions"
2. Configure category, difficulty, and question count
3. Optionally specify a custom topic
4. Generate questions and start the game

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── services/  # API services (including Gemini)
│   │   │   └── stores/    # State management
│   │   └── types/         # TypeScript type definitions
├── server/                # Backend Express server
│   ├── routes.ts          # WebSocket and API routes
│   └── index.ts           # Server entry point
└── shared/                # Shared utilities
```

## Technologies Used

### Frontend

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Zustand for state management
- Radix UI for components
- Google AI SDK for Gemini integration

### Backend

- Express.js
- WebSocket for real-time communication
- UUID for unique identifiers

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking

### Environment Variables

- `VITE_GEMINI_API_KEY` - Google Gemini API key (optional, for AI questions)

## Documentation

- [Custom Questions Setup](./CUSTOM_QUESTIONS_README.md) - AI-generated questions feature
- [Multiplayer Documentation](./MULTIPLAYER_README.md) - Online multiplayer implementation
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:

1. Check the documentation files
2. Look for existing issues
3. Create a new issue with detailed information

---

**Note**: The AI-generated questions feature requires a valid Gemini API key and is subject to Google's terms of service and rate limits.
