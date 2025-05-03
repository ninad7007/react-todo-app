# React Todo App

A modern, responsive todo list application built with React, TypeScript, and IndexedDB for persistent storage. This application allows users to create and manage multiple todo lists with features like task creation, editing, deletion, and AI-powered task analysis.

## Features

- Create and manage multiple todo lists
- Add, edit, and delete tasks
- Set due dates and times for tasks
- Mark tasks as complete
- AI-powered task analysis and overview
- Persistent storage using IndexedDB
- Responsive design for all devices
- Modern UI with smooth animations
- Dark mode support

## Technologies Used

- React
- TypeScript
- IndexedDB (idb)
- CSS3
- Vite
- GitHub Pages (for deployment)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ninad7007/react-todo-app.git
cd react-todo-app
```

2. Install dependencies:

```bash
npm install
```

### Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

To create a production build:

```bash
npm run build
```

### Deployment

The app is deployed using GitHub Pages. To deploy changes:

```bash
npm run deploy
```

## Usage

1. Create a new list by clicking the "+" button
2. Add tasks to your list with optional due dates
3. Edit tasks by clicking the edit button
4. Mark tasks as complete by clicking the checkbox
5. Delete tasks or entire lists as needed
6. View AI-generated overviews of your tasks

## Project Structure

- `src/components/` - React components
- `src/services/` - Database and utility services
- `public/` - Static assets
- `src/App.tsx` - Main application component
- `src/main.tsx` - Application entry point

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React team for the amazing framework
- Vite for the fast development experience
- GitHub for hosting the project
