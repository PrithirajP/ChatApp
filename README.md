# 💬 ChatApp (MERN + Socket.IO)

A full-stack real-time chat application built with the **MERN** stack (MongoDB, Express, React, Node) and **Socket.IO** for real-time messaging and presence (online/offline). Frontend uses **Vite + React**. This README reflects the code structure: backend provides REST APIs + a Socket.IO server; frontend connects with `withCredentials` to send/receive messages and presence updates.

---

## 🚀 Highlights

* JWT-based authentication (httpOnly cookie)
* One-to-one chat with optimistic UI
* Real-time messaging & presence via **Socket.IO**
* Online / offline user status (server emits `getOnlineUsers`)
* Cloudinary image upload support

---

## 📁 Project structure (important parts)

```
ChatApp-main/
├── backend/
│   ├── src/
│   │   ├── controllers/         # auth, message controllers
│   │   ├── lib/                 # socket.js, db.js, cloudinary, env helpers
│   │   ├── middleware/          # auth & socket auth middleware
│   │   └── routes/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/               # ChatPage, LoginPage, SignUpPage
│   │   ├── components/          # Chat UI components
│   │   ├── store/               # useAuthStore, useChatStore (Zustand)
│   │   └── lib/                 # axios instance (baseURL => http://localhost:3000/api in dev)
│   └── package.json
└── README.md
```

---

## ⚙️ Required environment variables (backend/.env)

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173          # Vite dev origin (CORS for sockets)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RESEND_API_KEY=your_resend_api_key        # (optional) if using Resend for emails
EMAIL_FROM=you@example.com
EMAIL_FROM_NAME="ChatApp"
ARCJET_KEY=...                            # optional: project includes arcjet middleware
ARCJET_ENV=...                            # optional
NODE_ENV=development
```

> Ensure `CLIENT_URL` matches frontend origin so Socket.IO CORS allows connections. For production set `CLIENT_URL` to the deployed frontend origin and configure cookie domain/secure flags accordingly.

---

## 🛠 Development (local)

Open two terminals (or use a process manager like tmux):

### 1) Backend

```bash
cd backend
npm install
npm run dev         # runs nodemon (defaults to PORT=3000 if not set)
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev         # Vite dev server (default: http://localhost:5173)
```

* API base (development): `http://localhost:3000/api`
* Socket server: same as backend (Socket.IO), CORS allowed from `CLIENT_URL`.

---

## 🔌 Socket / Realtime contract

**Connection & Auth**

* Client connects with cookies: `io(BASE_URL, { withCredentials: true, autoConnect: false })`.
* Socket handshake expects JWT in httpOnly cookie named `jwt`. Backend's `socketAuthMiddleware` validates and attaches `socket.user` / `socket.userId`.

**Server emits**

* `getOnlineUsers` — emitted when someone connects/disconnects; payload: array of `userId` strings.
* `newMessage` — emitted to recipient when a message is created (server resolves recipient socket id and emits).

**Client listens**

```js
socket.on("getOnlineUsers", (userIds) => { /* update presence UI */ });
socket.on("newMessage", (message) => { /* add message to chat, play sound */ });
```

**Message sending flow**

1. Frontend posts to `POST /api/messages/send/:receiverId` (body may include `text` and/or `image`).
2. Backend persists message (handles Cloudinary if image).
3. Backend emits `newMessage` to recipient via Socket.IO.
4. Frontend updates UI (optimistic update and reconciles with server response).

---

## 🔎 High-level API (mounted under `/api`)

**Auth**

* `POST /api/auth/signup` — create account
* `POST /api/auth/login` — login (sets `jwt` cookie)
* `POST /api/auth/logout` — logout (clears cookie)
* `PUT /api/auth/update-profile` — update profile (protected)
* `GET /api/auth/check` — check current session (protected)

**Messages**

* `GET /api/messages/contacts` — list contacts
* `GET /api/messages/chats` — list chat partners
* `GET /api/messages/:id` — messages with user `:id`
* `POST /api/messages/send/:id` — send message to user `:id` (supports `text` and/or `image`)

---

## ✅ Production / Deployment

1. Build frontend:

```bash
cd frontend
npm run build
# output -> frontend/dist
```

2. Configure backend environment variables for production (set `NODE_ENV=production`, `CLIENT_URL`, DB URI, Cloudinary, JWT secret, cookie secure flags).

3. Start backend (backend will serve `frontend/dist`):

```bash
cd backend
npm install --production
npm start           # or use pm2/systemd
```

**Platform tips**

* Ensure `trust proxy` and cookie `secure` flags are set correctly if behind HTTPS/reverse proxy.
* Use a process manager (pm2, systemd) and enable logs.
* If deploying to services like Render/Heroku, add a `Procfile` or use the platform's startup command; ensure the build step for frontend is included.

---

## 🧩 Troubleshooting

* **Socket connection fails**:

  * Backend reachable? Check backend logs and network.
  * Is `jwt` cookie present? Socket auth requires it.
  * `CLIENT_URL` must match frontend origin for Socket.IO CORS.
* **Cookies not sent**:

  * Ensure Axios / socket.io-client use `withCredentials: true`.
  * In production, ensure cookie `SameSite`/`Domain`/`Secure` options are configured correctly.
* **Frontend API 404s**:

  * Verify backend base URL and that `/api` routes are mounted.
* **Cloudinary upload issues**:

  * Verify Cloudinary env vars and that uploaded file format is allowed.

---

## ✅ Tests / Linting (suggested)

* Add tests for backend routes and socket auth behavior.
* Lint frontend and backend before PRs (eslint/prettier recommended).

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feat/your-feature`
3. Commit changes and open a PR with a clear description
4. Add tests for backend changes and run linters

Please include end-to-end checks for socket behaviors if you modify realtime code.

---
