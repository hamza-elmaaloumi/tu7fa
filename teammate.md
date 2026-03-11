Teammate Setup — Windows
=========================

This file explains how to run the full project (Django API + Next.js frontend) on a Windows machine.

Prerequisites
- Install Python (recommend 3.11 or newer). Add Python to PATH.
- Install Node.js (recommend Node 18+). npm comes with Node.
- Git (optional) or copy the repo folder to the Windows machine.

Notes on environments
- You can use Command Prompt, PowerShell, or Windows Subsystem for Linux (WSL). The commands below show both PowerShell and CMD variants where activation differs.

Backend (Django)
-----------------
1. Open PowerShell or CMD and change into the server directory:

   cd server

2. Create and activate a virtual environment.

   PowerShell:

   python -m venv .venv
   # If PowerShell blocks activation, run once as admin:
   # Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
   .\.venv\Scripts\Activate.ps1

   Command Prompt (cmd.exe):

   python -m venv .venv
   .venv\Scripts\activate

3. Install Python dependencies:

   pip install --upgrade pip
   pip install -r requirements.txt

4. Run Django migrations:

   python manage.py migrate

5. (Optional) Create a superuser for admin access:

   python manage.py createsuperuser

6. Start the development server (binds to localhost:8000):

   python manage.py runserver 0.0.0.0:8000

   The API will be available at http://127.0.0.1:8000/ (or http://localhost:8000/).

Frontend (Next.js)
------------------
Open a new terminal window after the backend is running.

1. Change into the client directory:

   cd client

2. Install npm dependencies:

   npm install

3. Configure backend URL for the frontend (recommended):

   Create a file named `.env.local` in the `client` folder with this content:

   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

   (The code expects a local backend at port 8000 by default. If the frontend already hardcodes a backend URL, `.env.local` will centralize it for development.)

4. Start the Next.js dev server:

   npm run dev

   The frontend will be available at http://localhost:3000/ (try http://localhost:3000/products).

Windows-specific tips
- If you use PowerShell and activation is blocked, run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force` (run PowerShell as Administrator). Revert later if needed.
- If ports 3000 or 8000 are in use, either stop the process or change the port: for Django `python manage.py runserver 8001`, for Next `npm run dev -- -p 3001`.
- If you prefer WSL, follow Linux steps inside your distro; WSL often avoids Windows activation quirks.

Quick verification
- Start the backend, then the frontend, then visit: http://localhost:3000/products to see the public product listing.
- Use Django admin at http://localhost:8000/admin/ if you created a superuser.

Troubleshooting
- "Couldn't import Django" after activation: ensure the virtual environment is active and `pip list` shows `Django` and other packages from `requirements.txt`.
- npm install fails with native compilation errors: ensure you have a supported Node version (Node 18+ recommended) and Windows build tools if native modules are required.
- If the frontend talks to the wrong backend, ensure `.env.local` is present and the app has been restarted.

Helpful commands summary
- Backend (PowerShell):

  cd server
  python -m venv .venv
  .\.venv\Scripts\Activate.ps1
  pip install -r requirements.txt
  python manage.py migrate
  python manage.py runserver 8000

- Frontend:

  cd client
  npm install
  # create client/.env.local with NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
  npm run dev

Questions or next steps
- Want me to also add a `client/.env.example` and a short `server/README.md`? I can create them and wire the client to use `NEXT_PUBLIC_BACKEND_URL` consistently.
