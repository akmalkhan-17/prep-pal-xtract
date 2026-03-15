# PrepPal Xtract 🎯

An AI-powered mock interview platform that conducts adaptive technical interviews using your resume or a selected role. Get real-time feedback on your answers, video analysis of your body language, and detailed performance scores.

## Features

- **Resume-Based Interviews** — Upload your resume (PDF) and get interview questions tailored to your specific projects, skills, and experience.
- **Role-Based Interviews** — Choose a target role (Frontend, Backend, Full Stack, Mobile) for focused practice.
- **Adaptive Difficulty** — Questions dynamically adjust difficulty based on your performance — harder if you're doing well, easier if you're struggling.
- **Audio Transcription** — Speak your answers naturally; your audio is transcribed and evaluated automatically.
- **AI Evaluation** — Each answer is scored on technical accuracy and communication clarity with actionable feedback.
- **Video Analysis** — Face visibility, posture, gaze, and engagement are scored from your interview recording.
- **Detailed Results** — View a full breakdown of scores, transcripts, feedback, and video metrics after each interview.
- **Authentication** — Sign up with email (verification code) or Google OAuth.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Auth | Auth.js (NextAuth v5) + Google OAuth |
| Database | MongoDB Atlas + Mongoose |
| AI/LLM | Groq (LLaMA 3.3 70B) |
| Audio/Video/Resume | Python microservice (FastAPI + Whisper + OpenCV) |
| Email | Resend + React Email |
| Validation | Zod |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Sign-in & sign-up pages
│   ├── dashboard/       # Dashboard, setup, interview & results pages
│   └── api/
│       ├── interview/   # start, question, answer, end, resume/parse
│       ├── auth/        # NextAuth routes
│       └── ...
├── components/          # Interview & results client components
├── lib/                 # Interview engine, Groq client, Python service client
├── model/               # Mongoose schemas (User, Interview, Questions)
└── schemas/             # Zod validation schemas
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Groq API key
- Google OAuth credentials
- Python microservice running (for resume parsing, audio transcription, video analysis)

### Installation

```bash
git clone https://github.com/akmalkhan-17/prep-pal-xtract.git
cd prep-pal-xtract
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
RESEND_API_KEY=your_resend_api_key
AUTH_SECRET=your_auth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
PYTHON_SERVICE_URL=http://127.0.0.1:8000
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to get started.

## How It Works

1. **Sign up / Sign in** — Create an account or use Google OAuth
2. **Setup** — Choose interview type: upload your resume or pick a role
3. **Interview** — Answer 3 adaptive questions via voice with live camera preview
4. **Results** — Get detailed scores, transcripts, AI feedback, and video analysis

## Deployment

- **Frontend + Backend**: Deploy as a single project on [Vercel](https://vercel.com)
- **Python Service**: Deployed separately on [Hugging Face Spaces](https://huggingface.co/spaces)

## License

MIT
