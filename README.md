# GitHub Bug Fixer

A MERN-stack dashboard that fetches GitHub issues labeled `bug`, `error`, or `help wanted`, clones the repository, uses a Large Language Model to identify the likely faulty file, and generates a proposed code fix.

The system does not apply fixes automatically. Instead, it shows a side-by-side diff on a web dashboard so a developer can explicitly accept or reject the change.

## Project structure

- `server/` — Express backend, MongoDB issue store, GitHub issue fetch, repo cloning, AI analysis, fix suggestion, accept/reject.
- `client/` — React + Vite dashboard UI with issue list, diff viewer, and accept/reject actions.

## Setup

1. Install dependencies for both server and client.

```powershell
cd server
npm install

cd ..\client
npm install
```

2. Create a `.env` file in `server/` using `server/.env.example`.

3. Set environment variables:

- `MONGO_URI` — MongoDB connection URI
- `GITHUB_TOKEN` — GitHub PAT for REST API access
- `GROQ_API_KEY` — API key for the LLM service
- `PORT` — optional server port (default `5000`)

4. Start MongoDB locally or via a hosted service.

5. Launch the backend and frontend.

Option A: run each service separately
```powershell
cd server
npm start

cd ..\client
npm start
```

Option B: use the root workspace scripts to install and run both services together
```powershell
cd ..
npm install
npm run install:all
npm run dev
```

6. Open the frontend URL shown by Vite, typically `http://localhost:5173`.

## Usage

- Enter a GitHub owner and repo.
- Click `Fetch Issues`.
- Select an issue from the list.
- Click `Analyze & Suggest Fix`.
- Review the AI's suggested fix side-by-side with the original code.
- Accept or reject the fix.

## Notes

- The backend uses `server/routes/github.js` to fetch issues from GitHub.
- It clones repositories into `server/cloned_repos/`.
- The AI logic lives in `server/services/aiService.js`.
- The diff UI is rendered with `react-diff-viewer-continued`.
