SlotSwapper - Full Stack Intern Challenge (ServiceHive)

Submitted by: ANAND V

Email: anandv.csbs2023@citchennai.net

LinkedIn:https://www.linkedin.com/in/anand-v-366230290/



To the ServiceHive Hiring Team,

Thank you for the opportunity to take on this technical challenge. I've built "SlotSwapper," a full-stack, peer-to-peer scheduling application, as requested.

My primary goal was to build a robust, production-ready application that not only meets all core requirements but also demonstrates a deeper understanding of full-stack development by including several key bonus features. I focused on creating a clean, scalable, and highly interactive user experience.

Technology Stack

I chose the following technologies to build this project:

Frontend: React, TypeScript, Vite, TailwindCSS

UI/Styling: lucide-react (for icons), react-hot-toast (for notifications)

Backend: Node.js, Express, MongoDB (with Mongoose)

Real-time: Socket.io

Testing: Jest, Supertest, mongodb-memory-server

Containerization: Docker & Docker Compose (with Nginx)

Project Features & Walkthrough

The application successfully fulfills all core requirements from the challenge brief.

Core Functionality

Authentication: A complete user authentication system using JWT. Users can sign up, log in, and all protected API routes are secured with Bearer token middleware.

Data Model: A clear and logical backend data model using Mongoose for Users, Events, and SwapRequests.

Dashboard & Event CRUD: A responsive user dashboard where users have full Create, Read, Update, and Delete (CRUD) permissions over their own events.

Core Swap Logic: The primary swap-flow is fully implemented:

Marketplace: The GET /api/swappable-slots endpoint correctly populates the Marketplace with all SWAPPABLE slots, except for the user's own.

Requesting: POST /api/swap-request creates a new SwapRequest, links the two users, and sets both events to SWAP_PENDING.

Responding: POST /api/swap-response handles both accept (which correctly exchanges the userId on the two Event documents) and reject logic.

Dynamic State: The entire UI updates dynamically on data changes. I've ensured that after any action (creating, swapping, deleting), the state is re-fetched and displayed without requiring a manual page reload.

Beyond the Brief: Added Bonus Features

I wanted to take this project a step further to demonstrate my skills in real-time architecture, advanced backend logic, and testing. I've added the following features:

Real-time Notifications with Socket.io:
I implemented a full-stack socket.io solution. When a user receives a new swap request or a response to one they've sent, they receive an instant toast notification. A notification bell in the header shows an "unread" dot and a popover list of recent messages. The UI for all users updates instantly.

Advanced Swap & Delete Logic (Cancellation):
Users can "Abort" a request they've already sent. This is handled by a custom PUT /api/events/:id endpoint that understands when a SWAP_PENDING event is being changed. The backend safely deletes the pending SwapRequest and resets both events' statuses, making it a clean, atomic operation.

Professional UI & UX Enhancements:
I replaced all native alert() messages with react-hot-toast notifications for a modern, non-blocking user experience. I also widened the layout for desktops, added lucide-react icons to all buttons, and included subtle hover effects on all list items.

Backend Integration Testing (Jest & Supertest):
I wrote a comprehensive integration test for the entire swap-logic flow. The test uses mongodb-memory-server to spin up a real, temporary database. It proceeds to sign up two users, log them in, create slots, request a swap, accept the swap, and finally assert that the event owners were correctly exchanged in the database.

Full Containerization with Docker Compose:
The entire application (backend, frontend, and a MongoDB instance) can be built and launched with a single command: docker-compose up. The frontend Dockerfile is a production-ready, multi-stage build that serves the static React files using a lightweight Nginx server, which also proxies all API requests to the backend.

How to Run the Project

You can run this project in two ways.

Option 1: Local Development

Prerequisites: Node.js, MongoDB (local or Atlas string), npm or yarn.

Backend:

# 1. Navigate to /backend
cd backend
# 2. Install dependencies
npm install
# 3. Create a .env file and add your MONGO_URL and JWT_SECRET
touch .env
# 4. Run the backend
npm run dev


Frontend:

# 1. (In a new terminal) Navigate to /frontend
cd frontend
# 2. Install dependencies
npm install
# 3. Run the frontend
npm run dev
# App will be running on http://localhost:5173


Option 2: Docker Compose (Recommended)

This is the simplest way to run the entire application, including the database.

Prerequisites: Docker Desktop

Run:

# 1. From the ROOT directory of the project
# (You must be in the same folder as docker-compose.yml)

# 2. Build and run all services
docker-compose up --build

# 3. That's it!
#    The application is running at http://localhost:5173


To stop all services, run docker-compose down.

Postman Collection

I've included a SlotSwapper.postman_collection.json file in the root of this repository. You can import it into Postman to easily test all API endpoints.

Thank you again for this challenging and engaging project.
