# Mediator - AI-Powered Conflict Resolution Platform

An interactive conflict resolution platform using AI to mediate disputes between two parties in real-time, providing personalized solutions for both sides.

## Features

- Split-screen interface for simultaneous conflict resolution
- AI-powered conversation guidance
- Real-time interaction between both parties
- Personalized resolution strategies for each participant
- TypeScript implementation for type safety
- Built with Next.js and React for optimal performance

## Technologies Used

- Next.js
- React
- TypeScript
- OpenAI API
- Zustand for state management

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/drewcarroll/mediator.git
   ```

2. Install dependencies
   ```bash
   cd mediator
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:
   ```plaintext
   OPENAI_API_KEY=your_api_key_here
   ```
   You can get an API key from OpenAI's website

4. Run the development server
   ```bash
   npm run dev
   ```
   The app will be running on http://localhost:3000

## Usage

1. Open http://localhost:3000 in two different browser windows
2. Each party types their perspective of the conflict
3. Once both parties have explained their positions, the system provides personalized resolution strategies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
