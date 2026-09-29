# 🌌 ChatSpace — Real-Time Topic-Based Workspace & Personal Messaging

ChatSpace is a modern full-stack real-time communication platform built with **Node.js, Express, Socket.IO, React, Vite, and Tailwind CSS**.

It combines the best aspects of modern team collaboration workspaces (Discord & Slack) with direct personal messaging, topic-based rooms, threaded replies, emoji reactions, and live presence.

---

## 🚀 Key Features

### 1. 💬 Personal Direct Messaging (1-to-1)
- Search any user and start a private conversation.
- Real-time instant messaging via Socket.IO.
- Typing indicator (`"Rahul is typing..."`).
- Online / Offline presence with last-seen timestamps.
- Unread message count badges.
- Message editing and deletion (Delete for me / Delete for everyone).
- Emoji reactions (`👍`, `❤️`, `🔥`, `🚀`, `😂`, `💡`, `💯`).
- Parent message reply quotes (`↳ Replying to ...`).

### 2. 👥 Group & Community System
- Create groups with name, description, and avatar presets.
- Member roles: **Owner**, **Admin**, **Member**.
- Group settings modal: Add/invite members, promote/demote roles, or leave group.

### 3. 🏷️ Topic-Based Rooms (Flagship Feature)
- Groups do NOT have just one single giant chat.
- Create multiple focused, topic-based rooms inside any group:
  - `#general` — Campus announcements & welcomes
  - `#dsa` — Algorithms, LeetCode, graph theory discussions
  - `#assignments` — Coursework submissions & doubt clearing
  - `#placements` — Interview preparation, mock drives & CTC discussions
  - `#projects` — Hackathon teams & capstone reviews
- Independent message histories for every topic room.
- Public or Private room visibility controls.

### 4. 🧵 Replies & Message Threads
- Reply to any message in both personal chats and topic rooms using `parentMessageId`.
- Interactive **Thread Drawer** panel on the right displaying the root message, reply stream, and dedicated reply composer.

### 5. ⚡ Real-Time Socket.IO Architecture
- Scoped room channels:
  - `private-chat:<conversationId>`
  - `group-room:<roomId>`
  - `user:<userId>` (for personal notifications & direct updates)
- Events: `send_message`, `receive_message`, `message_edited`, `message_deleted`, `reaction_updated`, `typing_start`, `typing_stop`, `user_online`, `user_offline`, `conversation_updated`.

### 6. 🎨 Ultra-Modern Dark Theme & Aesthetics
- Tailored dark palette (`#0B0E14`, `#111622`, `#151B28`, `#1A2234`).
- Glassmorphic panels with backdrop blurs.
- Electric Indigo & Violet accents with subtle glow shadows.
- Discord/Slack hybrid layout with server rail, channel drawer, chat feed, and thread drawer.
- Built-in Web Audio API sound cues for message delivery and receipt.

### 7. 🚀 Instant Demo Mode & Switcher
- Comes pre-seeded with rich demo data:
  - **Soham** (Owner of College CSE, Full-Stack Dev)
  - **Rahul** (Admin, Competitive Programmer)
  - **Aman** (Member, Backend Systems)
  - **Priya** (Member, Product Designer)
- **1-Click Quick Demo Switcher**: switch identities instantly with a single click to test multi-user real-time chats across multiple tabs!
- Seamless MongoDB fallback: if MongoDB is running, it connects via Mongoose; if not running, it runs in High-Performance In-Memory Demo Store mode without crashing!

---

## 🛠️ Tech Stack

- **Frontend**: React (Pure JavaScript), Vite, Tailwind CSS, Socket.IO Client, React Router, Axios, Lucide React
- **Backend**: Node.js, Express.js (Pure JavaScript, Modular Monolith), Socket.IO, JWT Auth, bcryptjs
- **Database**: Mongoose Schemas & MongoDB with built-in in-memory fallback store

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
Run from root:
```bash
npm run install:all
```
Or install manually:
```bash
cd server && npm install
cd ../client && npm install
```

### Running Locally
To run both backend and frontend:

**Option 1: Two Terminals (Recommended)**
```bash
# Terminal 1 - Backend Server (Port 5000)
cd server
npm run dev

# Terminal 2 - Frontend Client (Port 5173)
cd client
npm run dev
```

Open your browser at: **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Demo Accounts (Password: `demo123`)

| Username | Email | Role in College CSE |
|---|---|---|
| **Soham** | `soham@chatspace.dev` | Owner |
| **Rahul** | `rahul@chatspace.dev` | Admin |
| **Aman** | `aman@chatspace.dev` | Member |
| **Priya** | `priya@chatspace.dev` | Member |

*(You can also use the 1-click Demo Switcher pills on the login screen or inside the app!)*

---

## 📂 Project Architecture

```text
Chat-Application/
│
├── server/
│   ├── config/
│   │   ├── db.js               # MongoDB connection + Demo store fallback
│   │   └── jwt.js              # Token signing & verification
│   ├── models/                 # Mongoose schemas
│   │   ├── User.js
│   │   ├── Conversation.js
│   │   ├── Group.js
│   │   ├── GroupMember.js
│   │   ├── Room.js
│   │   ├── Message.js
│   │   └── Notification.js
│   ├── controllers/            # HTTP Request Controllers
│   ├── routes/                 # Express API routes (/api/*)
│   ├── services/
│   │   └── store.js            # Unified data store with pre-seeded demo dataset
│   ├── middleware/             # JWT auth & error handling
│   ├── sockets/
│   │   └── socketHandler.js    # Socket.IO real-time event router
│   ├── utils/
│   └── server.js               # App entrypoint
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── chat/           # ChatHeader, MessageList, MessageItem, Composer, ThreadDrawer
    │   │   ├── sidebar/        # ServerRail, ChannelSidebar, DMSidebar, UserFooter
    │   │   ├── modals/         # CreateGroup, CreateRoom, Settings, DemoSwitcher, Search
    │   │   └── common/         # Avatar, Badges
    │   ├── context/            # AuthContext, SocketContext, ChatContext, NotificationContext
    │   ├── pages/              # LoginPage, RegisterPage, ChatPage
    │   ├── services/           # Axios API client
    │   └── App.jsx
    ├── tailwind.config.js
    └── vite.config.js
```
