# TaskBoard - Multilingual Kanban Board Application

A modern, responsive Kanban board application built with Next.js, TypeScript, and i18n internationalization support.

## Features

- 🌐 **Multilingual Support** - English, Spanish, and French
- 🌙 **Dark/Light Theme** - Automatic theme switching
- 📱 **Responsive Design** - Works on all devices
- 🎯 **Drag & Drop** - Intuitive task management
- ⚡ **Performance Optimized** - Fast loading and smooth animations
- 🔧 **TypeScript** - Full type safety
- 🎨 **Tailwind CSS** - Modern styling

## Tech Stack

- **Framework**: Next.js 13+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Internationalization**: next-i18next
- **Drag & Drop**: @hello-pangea/dnd
- **Icons**: Lucide React
- **Theme**: next-themes

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd taskboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

### Database Setup

This project requires a PostgreSQL database. 

1.  Create a `.env.local` file in the root of the project.
2.  Add your database connection string to the `.env.local` file:

```
DATABASE_URL="postgresql://user:password@host:port/database"
```

Replace `user`, `password`, `host`, `port`, and `database` with your actual database credentials.

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
taskboard/
├── components/          # Reusable React components
├── pages/              # Next.js pages
├── public/locales/     # Translation files
├── styles/             # Global styles
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── next-i18next.config.js
└── next.config.js
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting
- `npm run type-check` - Run TypeScript check

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.