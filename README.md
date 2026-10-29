# 🌌 ChatSpace — Real-Time Workspace & Direct Messaging Platform

> **A production-ready, full-stack real-time collaboration and workspace messaging platform inspired by Discord and Slack, powered by Node.js, Express, Socket.IO, React, Vite, Tailwind CSS, and MongoDB.**

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Socket.IO-v4-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Real-Time Flow](#-architecture--real-time-flow)
- [Folder Structure](#-folder-structure)
- [Tech Stack](#-tech-stack)
- [Quick Start Guide](#-quick-start-guide)
- [Pre-Seeded Demo Accounts](#-pre-seeded-demo-accounts)
- [Socket.IO Real-Time Event Protocol](#-socketio-real-time-event-protocol)
- [REST API Reference](#-rest-api-reference)
- [Environment Configuration](#-environment-configuration)
- [Production Deployment](#-production-deployment)
- [Contributing & License](#-contributing--license)

---

## 🌟 Overview

**ChatSpace** combines the best aspects of high-productivity developer workspaces (Slack/Discord) with personal, low-latency direct messaging (WhatsApp/Telegram). 

Whether you need focused community discussion rooms (`#general`, `#engineering`, `#design`, `#announcements`), threaded replies, or private 1-on-1 chats with live presence indicators and read receipts, ChatSpace delivers a fluid, responsive experience out of the box.

### Highlights:
- **⚡ Ultra-Low Latency**: Bidirectional WebSockets with Socket.IO room isolation.
- **🛡️ Resilience & Dual Store**: Runs seamlessly on **MongoDB Atlas** or instantly falls back to a high-speed **In-Memory Store** if no database connection is configured.
- **🎨 Modern Dark Aesthetic**: Tailored dark palette (`#0B0E14`, `#111622`, `#151B28`) with glassmorphic cards, glowing accents, and Web Audio API synthesized sound effects.
- **👥 1-Click Multi-User Switcher**: Instantly switch between test identities (`Soham`, `Rahul`, `Aman`, `Priya`) across different browser tabs for effortless real-time testing.

---

## 🚀 Key Features

### 1. 💬 Personal Direct Messaging (1-to-1)
- Instant user search by username, email, or full name.
- Real-time message exchange via scoped private rooms (`private-chat:<conversationId>`).
- Live **typing indicators** (`"Rahul is typing..."`).
- **Online / Offline presence** tracking with dynamic last-seen timestamps.
- Unread message count badges and delivered/read receipts.
- **Message Editing & Deletion** (Support for *Delete for Me* or *Delete for Everyone*).
- **Emoji Reactions** (`👍`, `❤️`, `🔥`, `🚀`, `😂`, `💡`, `💯`) with instant state synchronization.

### 2. 🏷️ Groups & Topic-Based Community Rooms
- Create customized communities/groups with custom names, descriptions, and avatars.
- Hierarchical role management: **Owner**, **Admin**, **Member**.
- **Topic Channels**: Groups feature multiple dedicated rooms rather than a cluttered single stream:
  - `#general` — Team-wide updates and welcomes
  - `#engineering` — Code reviews, bug triage, architecture discussions
  - `#design` — Wireframes, design systems, visual assets
  - `#random` — Casual watercooler banter
- Independent message histories, typing indicators, and permissions for each topic room.

### 3. 🧵 Message Threads & Quoted Replies
- Reply to any message in personal chats or topic rooms using `parentMessageId`.
- **Slide-out Thread Drawer**: A dedicated right-side panel showing the root message, reply chronology, and an isolated reply composer.
- Quoted parent message previews in the main feed (`↳ Replying to ...`).

### 4. 🔊 Web Audio Feedback & Sound Controls
- Built-in sound effects using the native Web Audio API (no heavy external audio files required).
- Distinct, crisp audio cues for sending messages and receiving incoming notifications.
- **Audio Mute/Unmute Toggle**: Convenient volume button in user footer with `localStorage` persistence.

### 5. 💻 Rich Message Formatting & Code Blocks
- **Clickable URLs**: Automatically parses and renders external links with secure `target="_blank"` attributes.
- **Inline & Multi-Line Code Blocks**: Supports inline `` `code` `` snippets and multiline ```` ``` ```` syntax containers with quick-insert button.
- **Interactive Mentions**: Highlights `@username` mentions in conversation feeds.
- **1-Click Message Copy**: Quick clipboard button on message hover and context menu with instant "Copied!" feedback.
- **Slash Commands**: Instant expansion for `/shrug`, `/tableflip`, `/unflip`, `/lenny`, and `/clear`.

### 6. 🔄 Auto-Reconnection & Resilience
- Socket.IO connection manager with automatic exponential backoff reconnection.
- Automatic room re-subscription and unread count refresh on connection restore.

---

## 🏗️ Architecture & Real-Time Flow

```
                               ┌────────────────────────────────┐
                               │       Client (React + Vite)    │
                               │  - ServerRail & Navigation     │
                               │  - ChatArea & MessageComposer  │
                               │  - ThreadDrawer & Modals       │
                               └──────────────┬─────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      │                                               │
               HTTP REST API                                   WebSocket Events
         (JWT Auth, Users, Groups)                      (Messages, Typing, Presence)
                      │                                               │
                      ▼                                               ▼
       ┌───────────────────────────────┐               ┌──────────────────────────────┐
       │     Express.js API Router     │               │   Socket.IO Event Handler    │
       │  - /api/auth                  │               │  - private-chat:<convId>     │
       │  - /api/conversations         │               │  - group-room:<roomId>       │
       │  - /api/groups & /rooms       │               │  - user:<userId>             │
       └──────────────┬────────────────┘               └──────────────┬───────────────┘
                      │                                               │
                      └───────────────────────┬───────────────────────┘
                                              │
                                              ▼
                               ┌──────────────────────────────┐
                               │   Unified Data Access Layer  │
                               │   (Mongoose / In-Memory)     │
                               └──────────────┬───────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      │                                               │
                      ▼                                               ▼
          [ MongoDB Atlas (Cloud) ]                      [ In-Memory Store Fallback ]
           - Persistent Collections                       - Instant Zero-Config Boot
           - Users, Messages, Groups                      - Pre-seeded Test Dataset
```

---

## 📂 Folder Structure

```text
Chat-Application/
├── .env.example              # Centralized environment variable template
├── .gitignore                # Git ignore rules for node_modules, builds, and envs
├── package.json              # Monorepo scripts (build, dev, install:all, start)
├── README.md                 # Project documentation
│
├── client/                   # Frontend SPA (React + Vite + Tailwind CSS)
│   ├── public/               # Static assets & SVG icons
│   ├── src/
│   │   ├── assets/           # Images & logos
│   │   ├── components/
│   │   │   ├── chat/         # ChatHeader, MessageList, MessageItem, Composer, ThreadDrawer
│   │   │   ├── common/       # Avatar, Badges, Loaders
│   │   │   ├── modals/       # CreateGroup, CreateRoom, Settings, DemoSwitcher, Search
│   │   │   └── sidebar/      # ServerRail, ChannelSidebar, DMSidebar, UserFooter
│   │   ├── context/          # AuthContext, SocketContext, ChatContext, NotificationContext
│   │   ├── pages/            # LoginPage, RegisterPage, ChatPage
│   │   ├── services/         # Axios API client (/api requests)
│   │   ├── utils/            # Web Audio sound cues & helpers
│   │   ├── App.jsx           # Main application shell & routing
│   │   ├── index.css         # Tailwind directives & global styling
│   │   └── main.jsx          # React DOM entrypoint
│   ├── .env.example          # Frontend Vite environment sample
│   ├── package.json          # Frontend dependencies & scripts
│   ├── tailwind.config.js    # Custom dark palette & theme extensions
│   └── vite.config.js        # Vite bundler configuration & proxy
│
└── server/                   # Backend Server (Node.js + Express + Socket.IO)
    ├── config/
    │   ├── db.js             # Mongoose connection with automatic fallback
    │   └── jwt.js            # JWT token creation & verification
    ├── controllers/          # HTTP request handlers (auth, group, message, room, user)
    ├── middleware/           # JWT authMiddleware & centralized errorHandler
    ├── models/               # Mongoose data models
    │   ├── Conversation.js   # 1-on-1 conversation metadata
    │   ├── Group.js          # Community / Group workspace schema
    │   ├── GroupMember.js    # Member associations & roles
    │   ├── Message.js        # Core message schema (content, reactions, threads)
    │   ├── Notification.js   # Alert & unread notification model
    │   ├── Room.js           # Topic channel schema
    │   └── User.js           # User profile & authentication schema
    ├── routes/               # Express REST API endpoints (/api/*)
    ├── services/
    │   └── store.js          # In-memory mock store & pre-seeded demo dataset
    ├── sockets/
    │   └── socketHandler.js  # Socket.IO connection, room routing & event handlers
    ├── utils/
    │   └── logger.js         # Structured server logging utility
    ├── .env.example          # Backend environment sample
    ├── package.json          # Backend dependencies & scripts
    └── server.js             # Express server & Socket.IO server initialization
```

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
|---|---|---|
| **Frontend Framework** | **React 19** | Component-driven declarative UI |
| **Build Tool** | **Vite 8** | Lightning-fast HMR and optimized production bundle |
| **Styling** | **Tailwind CSS 3** | Utility-first responsive design with custom dark palette |
| **Real-Time Engine** | **Socket.IO v4** | Full-duplex WebSocket communication with room multiplexing |
| **Icons & Audio** | **Lucide React** + **Web Audio API** | Modern icons and synthesized sound cues |
| **Backend Runtime** | **Node.js 18+** | High-performance asynchronous JavaScript runtime |
| **Web Framework** | **Express.js 4** | Modular REST API routing and middleware pipeline |
| **Authentication** | **JWT + bcryptjs** | Stateless HMAC-SHA256 tokens and secure salted password hashing |
| **Primary Database** | **MongoDB / Mongoose** | Flexible document database for schemas and relations |
| **Fallback Store** | **In-Memory Store** | High-performance in-memory fallback for zero-dependency execution |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### 1. Installation
Clone the repository and install all dependencies for both `server` and `client` using the single root script:

```bash
# Clone the repository
git clone https://github.com/Sunaina-04/Chat-application-UCA.git
cd Chat-application-UCA

# Install all dependencies (server + client)
npm run install:all
```

### 2. Configure Environment Variables
Copy the root `.env.example` to create your server `.env`:

```bash
cp .env.example server/.env
```

*(Optional: If you want to connect to a live MongoDB Atlas cluster, update `MONGODB_URI` in `server/.env`. If omitted, the app will seamlessly run in In-Memory Demo mode!)*

### 3. Run Locally (Development Mode)

Open two terminal tabs:

```bash
# Terminal 1 — Start Backend Server (Runs on http://localhost:5000)
npm run dev:server

# Terminal 2 — Start Frontend Client (Runs on http://localhost:5173)
npm run dev:client
```

Visit **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🔑 Pre-Seeded Demo Accounts

ChatSpace comes pre-configured with active demo accounts. Use them directly on the login screen or via the **1-Click Demo Switcher** inside the app:

| Username | Email | Password | Role | Specialization |
|---|---|---|---|---|
| **Soham** | `soham@chatspace.dev` | `demo123` | **Owner** | Full-Stack Systems |
| **Rahul** | `rahul@chatspace.dev` | `demo123` | **Admin** | Algorithms & Backend |
| **Aman** | `aman@chatspace.dev` | `demo123` | **Member** | Cloud & Distributed Systems |
| **Priya** | `priya@chatspace.dev` | `demo123` | **Member** | UI/UX & Design Systems |

> 💡 **Multi-User Testing Tip**: Open one tab with **Soham** and another tab (or Incognito window) with **Rahul**. Send messages, trigger typing indicators, add reactions, and watch instant live synchronization!

---

## ⚡ Socket.IO Real-Time Event Protocol

All real-time communication flows through scoped Socket.IO events authenticated via JWT:

| Event Name | Direction | Payload Parameters | Description |
|---|---|---|---|
| `join_conversation` | Client ➔ Server | `{ conversationId }` | Subscribes socket to private room `private-chat:<id>` |
| `leave_conversation` | Client ➔ Server | `{ conversationId }` | Unsubscribes socket from private conversation |
| `join_room` | Client ➔ Server | `{ roomId }` | Subscribes socket to community room `group-room:<id>` |
| `leave_room` | Client ➔ Server | `{ roomId }` | Unsubscribes socket from topic room |
| `send_message` | Client ➔ Server | `{ conversationId, roomId, content, parentMessageId }` | Sends message; server persists and broadcasts |
| `receive_message` | Server ➔ Client | `{ message, conversationId, roomId }` | Delivers incoming message to room subscribers |
| `typing_start` | Client ⇄ Server | `{ userId, username, conversationId, roomId }` | Emits live typing status to other room members |
| `typing_stop` | Client ⇄ Server | `{ userId, username, conversationId, roomId }` | Clears active typing status |
| `message_edit` | Client ➔ Server | `{ messageId, content }` | Updates existing message content |
| `message_edited` | Server ➔ Client | `{ message }` | Broadcasts modified message to room members |
| `message_delete` | Client ➔ Server | `{ messageId, deleteForEveryone }` | Deletes message for self or everyone |
| `message_deleted` | Server ➔ Client | `{ messageId, deleteForEveryone, message }` | Updates UI message list after deletion |
| `reaction_toggle` | Client ➔ Server | `{ messageId, emoji }` | Toggles user reaction on target message |
| `reaction_updated` | Server ➔ Client | `{ message }` | Broadcasts updated reaction counts and users |
| `message_read` | Client ➔ Server | `{ conversationId }` | Marks conversation as read by active user |
| `messages_read_by_user`| Server ➔ Client | `{ conversationId, userId, readAt }` | Notifies sender of read receipt confirmation |
| `user_online` | Server ➔ Client | `{ userId, status: 'online' }` | Broadcasts presence online event |
| `user_offline` | Server ➔ Client | `{ userId, lastSeen }` | Broadcasts presence offline event with timestamp |

---

## 📡 REST API Reference

All protected endpoints require the HTTP header:  
`Authorization: Bearer <your_jwt_token>`

### Authentication
- `POST /api/auth/register` — Register a new user account.
- `POST /api/auth/login` — Authenticate and receive a JWT.
- `GET /api/auth/me` — Retrieve the currently authenticated user profile.

### Users & Contacts
- `GET /api/users` — List available users with live presence status.
- `GET /api/users/search?q=:query` — Search users by username, email, or name.

### 1-on-1 Conversations
- `GET /api/conversations` — Retrieve all personal direct conversations for active user.
- `POST /api/conversations` — Create or open a 1-on-1 conversation with a target user.
- `GET /api/conversations/:id/messages` — Fetch message history for a conversation.

### Groups & Communities
- `GET /api/groups` — List groups the user belongs to.
- `POST /api/groups` — Create a new group/community workspace.
- `GET /api/groups/:id` — Get detailed group profile and members.
- `POST /api/groups/:id/members` — Add member to group (Owner/Admin only).

### Topic Rooms
- `GET /api/groups/:groupId/rooms` — List all topic channels inside a group.
- `POST /api/groups/:groupId/rooms` — Create a new topic room (e.g. `#engineering`).
- `GET /api/rooms/:roomId/messages` — Fetch message history for a topic room.

### Messages & Threads
- `POST /api/messages/:id/reactions` — Toggle emoji reaction on a message.
- `PUT /api/messages/:id` — Edit an existing message.
- `DELETE /api/messages/:id` — Delete a message.

---

## ⚙️ Environment Configuration

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | Optional | `5000` | Port for the backend Express server |
| `NODE_ENV` | Optional | `development` | Environment mode (`development` or `production`) |
| `JWT_SECRET` | **Required** | `(generated)` | Secret key for JWT cryptographic signing |
| `MONGODB_URI` | Optional | `(in-memory)` | MongoDB connection string (falls back to memory store if unset) |
| `CLIENT_URL` | Optional | `http://localhost:5173` | CORS allowed origin for frontend |
| `VITE_API_URL` | Optional | `""` | Backend API URL (only needed if frontend is hosted on separate domain) |
| `VITE_SOCKET_URL` | Optional | `""` | Backend WebSocket URL (only needed if frontend is hosted on separate domain) |

---

## 🚢 Production Deployment

ChatSpace is pre-configured for both **Single-Service Unified Deployment** and **Decoupled Deployment**:

### Option A: Unified Single-Service (Recommended for Render, Railway, Fly.io)
The Express backend builds and serves the Vite production bundle directly from `client/dist`:

1. Set the root build and start commands on your cloud host:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
2. Set Environment Variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=<your_secure_random_key>`
   - `MONGODB_URI=<your_atlas_connection_string>`
3. The server starts on `PORT`, serves API routes at `/api/*`, WebSockets at `/socket.io/*`, and single-page React frontend on all other routes.

### Option B: Decoupled (Vercel Frontend + Render Backend)
- **Backend (Render / Railway)**: Deploy `server/` with `npm start`. Set `CLIENT_URL=https://your-app.vercel.app`.
- **Frontend (Vercel)**: Deploy `client/`. Set `VITE_API_URL=https://your-backend.onrender.com` and `VITE_SOCKET_URL=https://your-backend.onrender.com`.

---

## 📄 Contributing & License

Contributions, bug reports, and feature requests are welcome!

Distributed under the **MIT License**. See `LICENSE` for more information.
