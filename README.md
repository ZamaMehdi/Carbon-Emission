## Overview
Energy tracker here takes input of meter usage from user for whole 12 months time period where user can input upto 3 values for a single month (in kWh). Them after that it will calculate carbon emission on that basis and display it. With database all the entries made were saved securely and can be accessed later when required to modify and to delete.

## Live Project
https://willowy-gnome-b23910.netlify.app/

## Key Features
 1. Electricity Usage Entry
    Add monthly electricity usage (in kWh) through an easy-to-use form.
    Data includes both actual and estimated usage entries.

 2. Interactive Charts
    Visualize electricity usage with bar charts powered by Recharts.
    Clear separation of actual vs estimated usage using different colors.

 3. Persistent Data Storage
    All usage data is stored locally using SQLite, allowing persistent records without a cloud          database.

 4. Full-Stack Integration
    Seamless connection between React frontend (Netlify) and Express backend (Render).
    Frontend communicates with the backend via environment-based API URL.

 5. CORS-Enabled API
    Backend is configured with CORS to securely handle requests from the deployed frontend.

 6. Deployed and Production-Ready
    Frontend hosted on Netlify, backend on Render — no local server needed to use it live.

 7. Carbon Awareness
    Promotes eco-consciousness by helping users monitor and manage their electricity usage over         time.

## Tech Stack
  React – For building the user interface and components
  Recharts – To visualize electricity usage with responsive bar charts
  CSS – Custom styling for layout and design
  Netlify – Hosting and deployment of the frontend
  Node.js – JavaScript runtime for the server
  Express.js – Web framework to handle API routes and requests
  CORS – Middleware for cross-origin request handling
  SQLite – Lightweight, file-based database for storing usage data
  Render – Hosting and deployment of the backend server

  ### Installation

1. Clone the repository.
2. Navigate to the project directory.
3. Run `npm install` to install dependencies.
4. Run `node index.js` to deploy the backend server.
5. Run `npm start` to deploy the frontend server.

## Future Improvements
!.Enhanced frontend for better look
2.Might add some carbon reduction plans

## Owner
- [Zama Mehdi](mailto:zamamehdi9@gmail.com)
