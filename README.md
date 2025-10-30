SlotSwapper - Full Stack Intern Challenge (ServiceHive)

Submitted by: ANAND V
Email: anandv.csbs2023@citchennai.net
LinkedIn: https://www.linkedin.com/in/anand-v-366230290/

To the ServiceHive Hiring Team,

Thank you for the opportunity to take on this technical challenge. I've built "SlotSwapper," a full-stack, peer-to-peer scheduling application, as requested.

My primary goal was to build a robust, production-ready application that not only meets all core requirements but also demonstrates a deeper understanding of full-stack development. I focused on creating a clean, scalable, and highly interactive user experience.

Live Application Links

You can test the live, deployed application here:

Frontend (Vercel):(https://slot-swapper-n4w1.vercel.app/)

Backend (Render): https://slotswapper-exq5.onrender.com/api/health

(Note: The backend is on a free Render plan, so it may take 30-60 seconds to "wake up" on the first load.)

Design Choices & Technology Stack

I chose the following technologies to build this project, balancing modern developer experience with production stability.

Frontend: React, TypeScript, & Vite

React for its component-based architecture and robust ecosystem.

TypeScript to ensure strong type-safety across the application, which is critical for a project with complex data models like Events and SwapRequests.

TailwindCSS for a utility-first styling approach that is fast, responsive, and easy to maintain.

Vite as the build tool for its blazing-fast local development experience.

Backend: Node.js, Express, & MongoDB

Node.js & Express for a lightweight, fast, and scalable API server.

MongoDB (with Mongoose) as the database. Its document-based model is a perfect fit for the application's data, allowing Users, Events, and SwapRequests to be modeled logically.

Real-time Communication: Socket.io

I chose Socket.io to provide instant, bidirectional communication. This makes the app feel alive and ensures users get immediate feedback on swap requests and responses.

Project Features

The application successfully fulfills all core requirements from the challenge brief.

Core Functionality

Full JWT Authentication: A complete user auth system. Users can sign up, log in, and all protected API routes are secured with Bearer token middleware.

Data Model: A clear and logical backend data model using Mongoose for Users, Events, and SwapRequests.

Dashboard & Event CRUD: A responsive user dashboard where users have full Create, Read, Update, and Delete (CRUD) permissions over their own events.

Core Swap Logic: The primary swap-flow is fully implemented:

Marketplace: GET /api/swappable-slots correctly populates the Marketplace with all SWAPPABLE slots, except for the user's own.

Requesting: POST /api/swap-request creates a new SwapRequest, links the two users, and correctly sets both events to SWAP_PENDING.

Responding: POST /api/swap-response handles both accept (which correctly exchanges the userId on the two Event documents) and reject logic.

Dynamic State: The entire UI updates dynamically on data changes. I've ensured that after any action (creating, swapping, deleting), the state is re-fetched and displayed without requiring a manual page reload.

Going Beyond the Requirements (Bonus Features)

I wanted to demonstrate my ability to think through product features, so I added several key improvements:

Real-time Notifications: I implemented a full-stack Socket.io solution. When a user receives a new swap request or a response, they get an instant toast notification. A notification bell in the header shows an "unread" dot and a popover list of recent messages.

Advanced Swap Cancellation: I built logic to handle a user "changing their mind."

On the Dashboard: Changing a SWAP_PENDING event back to BUSY will now find the associated SwapRequest in the database, delete it, and reset both users' events.

On the Requests Page: I added an "Abort" button to outgoing requests, which performs the same safe cancellation logic.

Backend Integration Testing (Jest & Supertest): I wrote a comprehensive integration test (server.test.js) for the entire swap-logic flow. The test uses mongodb-memory-server to spin up a real, temporary database. It proceeds to sign up two users, log them in, create slots, request a swap, accept the swap, and finally assert that the event owners were correctly exchanged in the database.

Professional UI & UX Enhancements: I replaced all native alert() messages with react-hot-toast notifications for a modern, non-blocking user experience. I also widened the layout for desktops and added lucide-react icons to all buttons and navigation links.

Full Containerization with Docker: The entire application (backend, frontend, and Nginx) can be built and launched with a single command: docker-compose up. The frontend Dockerfile is a production-ready, multi-stage build that serves the static React files using a lightweight Nginx server.

How to Run the Project

You can run this project in two ways.

Option 1: Local Development (Recommended)

Prerequisites: Node.js, npm, and a MongoDB Atlas connection string.

Backend:

Navigate to /backend: cd backend

Install dependencies: npm install

Create a .env file (touch .env) and add your variables:

MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key


Run the backend: npm run dev (Runs on localhost:5000)

Frontend:

(In a new terminal) Navigate to /frontend: cd frontend

Install dependencies: npm install

Run the frontend: npm run dev

The app will open and run on http://localhost:5173. The vite.config.ts file is already configured to proxy /api requests to your backend.

Option 2: Docker Compose

This is the simplest way to run the entire application.

Prerequisites: Docker Desktop (must be running).

From the ROOT directory of the project, run:

docker-compose up --build


That's it! The application will be available at http://localhost:5173.

API Endpoints & Postman

I've included a SlotSwapper.postman_collection.json file in the root of this repository. You can import it into Postman to easily test all API endpoints.

Here is a quick overview of the available routes:

Method

Endpoint

Description

POST

/api/auth/signup

Creates a new user.

POST

/api/auth/login

Logs in a user and returns a JWT.

GET

/api/events

(Protected) Gets all events for the logged-in user.

POST

/api/events

(Protected) Creates a new event for the user.

PUT

/api/events/:id

(Protected) Updates an event (e.g., status) or cancels a swap.

DELETE

/api/events/:id

(Protected) Deletes an event.

GET

/api/swappable-slots

(Protected) Gets all swappable slots not owned by the user.

GET

/api/swap-requests

(Protected) Gets all incoming/outgoing requests for the user.

POST

/api/swap-request

(Protected) Initiates a new swap request.

POST

/api/swap-response/:id

(Protected) Accepts or rejects an incoming swap request.

Challenges & Assumptions

Challenge: The most complex part of the challenge was ensuring the swap logic was "atomic"—that when a swap is accepted or canceled, all related documents (Event 1, Event 2, and SwapRequest) are updated correctly. I solved this by building the logic directly into the PUT /api/events/:id and POST /api/swap-response/:id endpoints.

Assumption: I assumed that a user "canceling" or "aborting" a swap request should have the same outcome as a REJECTED request. My backend logic either deletes the request (on an abort) or marks it as REJECTED (on a reject).

Thank you again for this challenging and engaging project. I enjoyed building it and look forward to discussing my solutions.
