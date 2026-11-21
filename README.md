\# AIChat



A full stack AI chat application built with \*\*.NET 10\*\* and \*\*React 19\*\*, featuring JWT authentication, conversation history, and integration with \*\*Ollama\*\* for local AI responses.



\## 📺 Demo



\*Video demo coming soon.\*



\## 🎯 Features



\- 🔐 JWT authentication with user registration and login

\- 💬 Real-time chat interface with message history

\- 🗂️ Multiple conversations per user, each with its own title

\- 🧠 Local AI integration with Ollama (no external API keys required)

\- 🗑️ Delete conversations (cascade deletes all messages)

\- 🎨 Dark-themed responsive UI with Tailwind CSS

\- 🛡️ Protected routes and per-user data isolation

\- 🔄 Automatic conversation title generation from the first message

\- 📜 Full conversation history sent to the model for context



\## 🛠️ Tech Stack



\### Backend

\- \*\*.NET 10\*\* (LTS)

\- \*\*ASP.NET Core Web API\*\*

\- \*\*Entity Framework Core 10\*\*

\- \*\*SQL Server (LocalDB)\*\*

\- \*\*JWT\*\* for authentication

\- \*\*BCrypt.Net\*\* for password hashing

\- \*\*OllamaSharp\*\* for local AI integration

\- \*\*Swashbuckle\*\* for API documentation



\### Frontend

\- \*\*React 19\*\*

\- \*\*TypeScript\*\*

\- \*\*Vite 8\*\*

\- \*\*React Router 7\*\*

\- \*\*Tailwind CSS 4\*\*

\- \*\*Axios\*\*



\### AI

\- \*\*Ollama\*\* running locally

\- Model: `openbmb/minicpm5-2b:latest` (configurable in `appsettings.json`)



\## 🧠 Technical Decisions



This section explains \*\*why\*\* certain design choices were made. These are the decisions that differentiate a production-minded project from a tutorial clone.



\### 1. Local AI with Ollama instead of a Cloud API



Instead of relying on OpenAI, Groq, or other cloud providers (which may be inaccessible or require credit cards), the application integrates with \*\*Ollama\*\* running locally. This means:

\- \*\*No API keys\*\* to manage or leak.

\- \*\*No usage costs\*\*.

\- \*\*Works offline\*\* once the model is downloaded.



The trade-off is that response quality depends on the local model and hardware. For a portfolio project, this is an excellent way to demonstrate AI integration without external dependencies.



\### 2. Conversation History Sent to the Model for Context



Every time a user sends a message, the backend rebuilds the \*\*full message history\*\* (user and assistant messages) and sends it to Ollama. This is how the model maintains context across turns. Without this, each message would be treated as an isolated prompt, and the AI would "forget" the conversation.



\### 3. Optimistic UI Updates in the Frontend



When the user sends a message, the frontend \*\*immediately adds it to the UI\*\* (optimistic update) before the backend responds. This makes the app feel responsive, even though the AI response may take several seconds on CPU-only hardware. If the request fails, the error banner informs the user.



\### 4. Per-User Data Isolation



Every conversation is scoped to the authenticated user via `UserId`. The `ChatController` filters all queries by `CurrentUserId`, so users can only see and delete their own conversations. This is enforced at the database level with a foreign key and at the API level with `\[Authorize]`.



\### 5. Cascade Delete for Messages



When a conversation is deleted, all its messages are automatically deleted via `OnDelete(DeleteBehavior.Cascade)`. This keeps the database clean and avoids orphaned records.



\## 📁 Project Structure



```

AIChat/

├── AIChat.Api/                      # Backend (.NET 10 Web API)

│   ├── Controllers/                 # API endpoints (Auth, Chat)

│   ├── Data/                        # EF Core DbContext

│   ├── DTOs/                        # Data Transfer Objects

│   ├── Migrations/                  # EF Core migrations

│   ├── Models/                      # Domain entities (User, Conversation, Message)

│   ├── Properties/                  # Launch settings

│   ├── Services/                    # JWT and Ollama services

│   ├── Program.cs                   # Application entry point

│   ├── appsettings.json             # Configuration

│   └── AIChat.Api.csproj            # Project file

└── aichat-client/                   # Frontend (React + TypeScript)

&#x20;   ├── public/                      # Static assets

&#x20;   ├── src/

&#x20;   │   ├── assets/                  # Images and SVGs

&#x20;   │   ├── components/              # ProtectedRoute

&#x20;   │   ├── context/                 # AuthContext

&#x20;   │   ├── pages/                   # Login, Register, Chat

&#x20;   │   ├── services/                # API client (axios)

&#x20;   │   ├── types/                   # TypeScript types

&#x20;   │   ├── App.tsx                  # Root component with routes

&#x20;   │   ├── main.tsx                 # React entry point

&#x20;   │   └── index.css                # Tailwind CSS import

&#x20;   ├── index.html                   # HTML template

&#x20;   ├── package.json                 # Dependencies and scripts

&#x20;   ├── tsconfig.json                # TypeScript configuration

&#x20;   └── vite.config.ts               # Vite + Tailwind configuration

```



> \*\*Note:\*\* `bin/`, `obj/`, and `node\_modules/` are auto-generated and excluded from the repository via `.gitignore`.



\## 🚀 Getting Started



\### Prerequisites

\- \[.NET 10 SDK](https://dotnet.microsoft.com/download)

\- \[Node.js LTS](https://nodejs.org/)

\- SQL Server Express LocalDB (comes with Visual Studio)

\- \[Ollama](https://ollama.com/) installed and running



\### Backend Setup



1\. Navigate to the backend folder:

&#x20;  ```bash

&#x20;  cd AIChat.Api

&#x20;  ```



2\. Apply database migrations:

&#x20;  ```bash

&#x20;  dotnet ef database update

&#x20;  ```



3\. Make sure Ollama is running with the configured model:

&#x20;  ```bash

&#x20;  ollama pull openbmb/minicpm5-2b:latest

&#x20;  ollama serve

&#x20;  ```



4\. Run the API:

&#x20;  ```bash

&#x20;  dotnet run

&#x20;  ```



5\. The API will be available at `https://localhost:XXXX`. Open Swagger at `https://localhost:XXXX/swagger`.



\### Frontend Setup



1\. Navigate to the frontend folder:

&#x20;  ```bash

&#x20;  cd aichat-client

&#x20;  ```



2\. Install dependencies:

&#x20;  ```bash

&#x20;  npm install

&#x20;  ```



3\. Run the development server:

&#x20;  ```bash

&#x20;  npm run dev

&#x20;  ```



4\. Open `http://localhost:5173` in your browser.



\## 📡 API Endpoints



\### Authentication



\- \*\*POST\*\* `/api/auth/register` — Register a new user

\- \*\*POST\*\* `/api/auth/login` — Login and receive a JWT



\### Chat (requires JWT)



\- \*\*GET\*\* `/api/chat/conversations` — List the user's conversations

\- \*\*GET\*\* `/api/chat/conversations/{id}` — Get a conversation with its messages

\- \*\*POST\*\* `/api/chat/conversations` — Create a new conversation

\- \*\*POST\*\* `/api/chat/conversations/{id}/messages` — Send a message and receive an AI response

\- \*\*DELETE\*\* `/api/chat/conversations/{id}` — Delete a conversation and all its messages



\## 🔐 Authentication Flow



1\. User registers or logs in via the frontend.

2\. Backend validates credentials and returns a JWT.

3\. Frontend stores the JWT in `localStorage`.

4\. Axios interceptor attaches the JWT to every subsequent request.

5\. Backend validates the JWT and extracts the user id from claims.

6\. All conversation queries are scoped to the authenticated user.



\## 🤖 AI Integration Flow



1\. User sends a message from the frontend.

2\. Backend saves the user message in the database.

3\. Backend builds the full conversation history (all previous messages).

4\. Backend sends the history to Ollama via `OllamaSharp`.

5\. Ollama generates a response using the local model.

6\. Backend saves the assistant message in the database.

7\. Backend returns the assistant message to the frontend.



\## 📄 License



This project is open source and available under the MIT License.

