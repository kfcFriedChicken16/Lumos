# Lumos - AI-Powered Study Assistant (Prototype)

*Turns any PDF into step-by-step lessons with mastery levels — plus optional micro-tutoring.*

## Demo Links
- 🎥 **Video**: [ADD_YOUTUBE_LINK]
- 🖼️ **Slides**: [ADD_SLIDES_LINK]
- 📁 **GitHub Repo**: [https://github.com/kfcFriedChicken16/Lumos]

## Track and Problem Statement
**Track:** Student Lifestyle  
**Problem Statement:** 
- Traditional tutoring is costly, inconvenient, and limited in availability
- Students often lack timely, affordable, and personalized academic support
- This hinders performance, increases stress, and discourages independent learning

Lumos is an intelligent AI-powered study assistant designed specifically for Malaysian university students. It provides personalized academic support through document analysis, adaptive learning experiences, and micro-tutoring sessions across multiple platforms (web and mobile).

## Key Features (Prototype)
*This is a demo; some flows are mocked (credits, volunteer payout).*

**Implemented:** Auth, PDF → topics, notes, practice panel, preferences.  
**Mocked:** credits, payouts, volunteer matching.

### 🎯 **AI-Powered Tutoring**
- **Document Analysis**: Upload PDFs and documents for AI-powered content analysis and learning path generation
- **Adaptive Learning**: Personalized responses based on user preferences, major, and learning style
- **Multi-language Support**: English, Bahasa Malaysia, and Chinese language options

### 📚 **Academic Support**
- **Study Planning**: Intelligent study session planning and progress tracking
- **Subject-Specific Help**: Specialized support for any subjects
- **Practice Questions**: AI-generated questions and exercises based on uploaded content
- **Learning Paths**: Structured progression from beginner to advanced topics

### 🎨 **User Experience**
- **Responsive Design**: Optimized for both web and mobile platforms


### 🔧 **Technical Features**
- **Authentication**: Secure user management with Supabase
- **File Processing**: PDF analysis and content extraction
- **Session Management**: Persistent study sessions and progress tracking

### 💰 **Micro-Tutoring**
- **Low-cost Sessions**: Short tutoring sessions (e.g., RM2/20min) for quick clarifications
- **Credit System**: Students use credits for sessions; volunteers earn rewards
- **Human Support**: Connect with qualified tutors for personalized help

## Tech Stack
### Frontend
- **Next.js 15** with TypeScript
- **React 19** with Framer Motion animations
- **Tailwind CSS** for styling

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **OpenRouter API** for AI capabilities
- **Supabase** for authentication and database

### AI Services
- **LLM via OpenRouter** (text-based responses)
- **PDF text extraction** (client-side processing)

## Setup & Deployment

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenRouter API key

### Quick Run Commands
```bash
# Check versions
npm -v && node -v

# Backend (Terminal 1)
cd lumos-backend && cp .env.example .env && npm i && npm run dev

# Frontend (Terminal 2)  
cd lumos-frontend && cp .env.local.example .env.local && npm i && npm run dev
```

### Development Setup
1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd Lumos
   ```

2. **Backend Setup**
   ```bash
   cd lumos-backend
   npm install
   cp .env.example .env
   # Add your environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd lumos-frontend
   npm install
   cp .env.local.example .env.local
   # Add your environment variables
   npm run dev
   ```

### Production Deployment
```bash
# Backend production
cd lumos-backend && npm run build && npm run start

# Frontend production  
cd lumos-frontend && npm run build && npm run start
```

### Environment Variables
   
   Backend (`.env`):
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   PORT=3001
   ```

   Frontend (`.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   NEXT_PUBLIC_WS_URL=ws://localhost:3001
   ```

## Troubleshooting
- **If supabaseUrl is required**: Ensure `.env` is loaded (use dotenv), check variable names
- **If 404 on API**: Confirm `NEXT_PUBLIC_BACKEND_URL` is correct

## Project Structure
```
Lumos/
├── lumos-backend/          # Backend API server
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # AI and external services
│   │   ├── middleware/     # Authentication middleware
│   │   └── utils/          # Utility functions
├── lumos-frontend/         # Next.js frontend
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── lib/            # Utility libraries
│   └── public/             # Static assets
└── docs/                   # Documentation
```

## Demo and Presentation
- **Video Presentation**: [Your YouTube video link here - max 5 minutes]
- **Live Demo**: [Your deployed application URL]
- **Presentation Slides**: [Link to your presentation slides]

## Team
- [Your name and role]
- [Team member names and roles if applicable]

## Documentation
- [Backend Setup Guide](./lumos-backend/SETUP_GUIDE.md)
- [Frontend Setup Guide](./lumos-frontend/FRONTEND_SETUP.md)
- [Authentication Setup](./lumos-backend/AUTH_SETUP.md)
- [Supabase Configuration](./lumos-backend/SUPABASE_SETUP.md)

## License
MIT

---

**Note**: Do not commit `.env*` files. Use `.env.example` and `.env.local.example`. Remember to replace the placeholder values (like `[your-repo-url]`, `[Your YouTube video link here]`, etc.) with your actual links and information before submitting.
