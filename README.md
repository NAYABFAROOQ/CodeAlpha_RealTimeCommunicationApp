# CodeAlpha Real-Time Communication Web Application
**Project Name:** CodeAlpha_RealTimeCommunicationApp  
**Author:** Nayab Farooq (Full Stack Development Intern)  

---

## 🚀 Overview
**AuraMeet** is a full-stack, production-grade Real-Time Communication Web Application engineered by **Nayab Farooq** with native WebRTC, Socket.io, React (Vite), Tailwind CSS, and Node.js/Express. It delivers seamless ultra-low-latency peer-to-peer video/audio conferencing, real-time screen sharing with live track replacement, an interactive synchronized HTML5 whiteboard, group messaging, and direct P2P chunked file transfer over WebRTC DataChannels.

---

## 🛠️ Tech Stack & Architecture

### **Frontend**
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS + Glassmorphism UI + Custom Animations
- **Icons:** Lucide React
- **Canvas Engine:** Native HTML5 2D Canvas API
- **Real-Time Client:** Socket.io Client (`socket.io-client`)
- **Media & P2P:** Native browser `RTCPeerConnection`, `RTCDataChannel`, Web Audio API `AudioContext` & `AnalyserNode`

### **Backend**
- **Runtime:** Node.js (v24+)
- **Server Framework:** Express.js
- **Real-Time Signaling:** Socket.io (WebSocket engine with fallback transports)
- **Database:** MongoDB via Mongoose with an automatic zero-config embedded persistence engine
- **Authentication & Security:** JSON Web Tokens (JWT), `bcryptjs` password hashing, DTLS/SRTP encrypted media

---

## 🌟 Key Features

### 1. Multi-User Video & Audio Conferencing (WebRTC)
- **Full-Mesh WebRTC Topology:** Multi-peer connectivity engineered for 4–6 concurrent participants with Google STUN servers (`stun:stun.l.google.com:19302`).
- **Media Controls:** 
  - Dynamic Microphone Mute / Unmute.
  - Camera Toggle (On / Off) with animated fallback avatars.
  - Device Switching (Microphone and Camera selectors via `enumerateDevices`).
  - Speaking Indicator: Real-time Web Audio API volume detection highlighting active speakers with glowing pulse rings and soundwave meters.
- **Dynamic Video Grid & Spotlight Mode:** Automatically adjusts layout (1, 2, 3, 4, 6 participants) with spotlight layout when sharing screens or pinning participants.

### 2. Real-Time Screen Sharing
- One-click screen capture powered by `navigator.mediaDevices.getDisplayMedia`.
- **Seamless `replaceTrack`:** Swaps video tracks on active WebRTC sender streams across all connected peers without renegotiating or dropping connections.
- Native `onended` listener automatically restores the webcam feed when sharing concludes.
- Visual presenting badge indicators.

### 3. Interactive Synchronized Whiteboard
- Collaborative drawing canvas built using HTML5 Canvas API with sub-pixel interpolation.
- Real-time stroke broadcasting across room participants via Socket.io with room history preservation for newly joined peers.
- **Tools:**
  - Pen / Brush with curated color palette (Neon Cyan, Indigo, Emerald, Amber, Rose, Purple, Black, White).
  - Variable stroke thickness (Fine, Medium, Bold, Heavy).
  - Eraser Tool.
  - Undo stroke action.
  - Clear canvas with confirmation.
  - High-resolution PNG image export.

### 4. Group Chat & P2P File Sharing
- **In-Room Messaging:** Real-time text messaging with sender tags, host badges, timestamps, and unread notification counter.
- **P2P File Transfer:** Direct peer-to-peer file transmission over `RTCDataChannel`.
  - 16KB ArrayBuffer chunking for cross-browser stability.
  - Live progress bar tracking send/receive percentage.
  - Direct download button upon byte assembly into a Blob.
- **Interactive Reactions:** Floating emoji reactions (👍, ❤️, 👏, 🎉, 🚀, 🔥) and hand-raise broadcast.

### 5. Authentication & Host Controls
- User registration and login with bcrypt hashing and JWT tokens.
- **Guest Access:** Zero-barrier guest entry with custom display names.
- **Room Security:** Dynamic unique room code generation, optional meeting passcodes, and lock states.
- **Host Controls:**
  - End meeting for all participants.
  - Remote mute individual participant or "Mute All".
  - Kick/remove participants from the meeting room.

---

## 📂 Project Directory Structure

```plaintext
CodeAlpha_RealTimeCommunicationApp/
├── client/                     # React (Vite) Frontend
│   ├── src/
│   │   ├── components/         # VideoGrid, VideoCard, Controls, Whiteboard, ChatPanel, ParticipantsPanel, RoomHeader, DeviceSettingsModal, Navbar
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── hooks/              # useWebRTC, useWhiteboard, useMediaStream
│   │   ├── pages/              # LandingPage, RoomPage, AuthPage
│   │   ├── utils/              # signaling.js (STUN & File chunking), canvasHelpers.js
│   │   ├── App.jsx             # Router and core layout coordinator
│   │   ├── index.css           # Design tokens, Tailwind directives & glassmorphism
│   │   └── main.jsx            # Entry point
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server/                     # Express & Socket.io Backend
│   ├── config/                 # db.js (MongoDB + graceful fallback store)
│   ├── controllers/            # authController.js, roomController.js
│   ├── middleware/             # authMiddleware.js (JWT validation)
│   ├── models/                 # User.js, Room.js, memoryStore.js, index.js
│   ├── routes/                 # authRoutes.js, roomRoutes.js
│   ├── sockets/                # signalingHandler.js (WebRTC relay, whiteboard, chat)
│   ├── server.js               # Entry point
│   ├── .env                    # Port and configuration
│   └── package.json
├── package.json                # Root management scripts
└── README.md
```

---

## ⚙️ Installation & Running Locally

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### 1. Start the Backend Server
```bash
cd CodeAlpha_RealTimeCommunicationApp/server
npm install
npm run start
```
*The server will run on `http://localhost:5001` (WebSocket: `ws://localhost:5001`).*  
*(Note: If a local MongoDB instance is running, it connects automatically; otherwise it seamlessly utilizes the built-in embedded store so you can test immediately with zero database setup!)*

### 2. Start the Frontend Client
In a new terminal:
```bash
cd CodeAlpha_RealTimeCommunicationApp/client
npm install
npm run dev
```
*The Vite development server will start on `http://localhost:5173`.*

### 3. Open in Browser
Open `http://localhost:5173` in your browser.
To simulate a multi-user conference:
1. Open `http://localhost:5173` in regular window and click **New Meeting** or **Start Meeting**.
2. Copy the shareable room link or code.
3. Open an Incognito / Private window or a second browser and paste the link.
4. Both participants will connect via WebRTC, display live video/audio, exchange whiteboard strokes, chat, and share files!

---

## 📡 Real-Time Socket Event Reference

| Event Name | Direction | Description |
|------------|-----------|-------------|
| `join-room` | Client ➔ Server | Join room with `roomId`, `peerId`, and user metadata |
| `room-users` | Server ➔ Client | Returns array of existing peers in the room |
| `user-connected` | Server ➔ Client | Broadcasts newly joined participant to room |
| `signal-offer` | Bidirectional | Relays WebRTC SDP Offer to target peer |
| `signal-answer` | Bidirectional | Relays WebRTC SDP Answer to offering peer |
| `signal-ice-candidate` | Bidirectional | Relays ICE candidates between peers |
| `media-state-change` | Client ➔ Server | Synchronizes mic/camera/screen state |
| `whiteboard-draw` | Bidirectional | Broadcasts stroke points across peers |
| `whiteboard-clear` | Bidirectional | Broadcasts canvas clear event |
| `whiteboard-history-sync` | Server ➔ Client | Syncs full drawing history to newly joined peer |
| `send-chat-message` | Bidirectional | Broadcasts text messages with timestamps |
| `send-reaction` | Bidirectional | Broadcasts floating emoji reaction |
| `raise-hand` | Bidirectional | Broadcasts hand raise status |
| `host-kick-participant`| Host ➔ Server | Removes participant from room |
| `host-mute-participant`| Host ➔ Server | Remotely mutes target participant |
| `host-end-room` | Host ➔ Server | Terminates meeting for all participants |

---

## 🔒 Security & Best Practices
- **DTLS & SRTP:** All WebRTC media streams and DataChannels are end-to-end encrypted by default at the transport layer.
- **Passcode Protection:** Rooms can be protected by passwords verified server-side.
- **Password Hashing:** Passwords encrypted using bcrypt with 10 salt rounds.
- **JWT Protection:** Sensitive endpoints safeguarded by bearer tokens.

---

## 🏆 CodeAlpha Internship Submission
Completed for **CodeAlpha Full Stack Web Development Internship (Task 4)**. Meets and exceeds all production-grade requirements for real-time video conferencing, screen sharing, synchronized whiteboarding, and P2P data transfer.
