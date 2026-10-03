# AI-Assisted GitHub Bug Analysis and Code Fix Recommendation

An LLM-powered MERN application that analyzes GitHub issues, identifies likely faulty files, and generates code-fix recommendations with developer-controlled diff review and accept/reject workflow.

## Overview

Manually triaging GitHub issues and locating the specific file responsible for a reported bug can be time-consuming, especially in larger codebases.

This project uses Large Language Models (LLMs) to assist developers in analyzing GitHub issues and identifying the most likely source file associated with a reported problem. After identifying the relevant file, the system generates a proposed code-level fix.

The system does **not** automatically modify the repository. Instead, the proposed change is presented through a side-by-side code diff, allowing the developer to explicitly **accept or reject** the suggested fix.

This approach combines AI-assisted code analysis with developer oversight.

## Key Features

* Fetches GitHub issues through the GitHub REST API
* Filters issues using labels such as `bug`, `error`, and `help wanted`
* Clones the selected GitHub repository for analysis
* Inspects repository file structure
* Uses LLMs to analyze issue descriptions and repository context
* Supports multiple LLM models for AI-assisted analysis
* Identifies the likely faulty file
* Generates an AI-assisted code-fix recommendation
* Displays original and suggested code using a side-by-side diff
* Allows developers to accept or reject proposed changes
* Stores issue and analysis information using MongoDB
* Provides a React-based dashboard for the complete workflow
* Supports multiple programming and web-development file types

## System Workflow

```text
GitHub Repository
       |
       v
Fetch Issues
       |
       v
Clone Repository
       |
       v
Repository File Structure
       |
       v
LLM-Based Issue Analysis
       |
       v
Likely Faulty File
       |
       v
LLM Code-Fix Generation
       |
       v
Side-by-Side Diff
       |
       +------------------+
       |                  |
       v                  v
    Accept              Reject
       |
       v
Developer-Controlled Workflow
```

## Architecture

The system consists of the following major components:

### 1. GitHub Integration

The backend communicates with the GitHub REST API to retrieve repository issues and relevant repository information.

### 2. Repository Processing

The selected repository is cloned locally into the backend workspace. The system processes the repository structure to provide relevant context for AI-based analysis.

### 3. LLM Analysis

The issue description and repository file structure are provided to an LLM to determine the most likely file associated with the reported problem.

### 4. Code-Fix Recommendation

The identified source file and issue description are passed to the LLM to generate a proposed code-level correction.

### 5. Developer Review

The generated change is displayed as a side-by-side diff. The developer can explicitly accept or reject the proposed modification rather than allowing the AI to modify code automatically.

## LLM Integration

The application uses Large Language Models for issue analysis, faulty-file identification, and code-fix recommendation.

The project supports experimentation with multiple LLM models:

* **GPT-OSS 120B**
* **Qwen 3.6 27B**
* **ALLAM-2-7B**

These models can be used to analyze issue descriptions together with repository file structure and generate proposed code-level fixes.

The LLM integration is implemented through the backend AI service. Model selection and performance depend on the configured AI provider and evaluation setup.

## Supported File Types

The system can analyze repositories containing common programming and web-development files, including:

* HTML
* CSS
* JavaScript
* TypeScript
* Python
* React JSX
* TSX
* PHP
* SCSS

## Technology Stack

### Frontend

* React
* Vite
* JavaScript
* CSS
* React Diff Viewer

### Backend

* Node.js
* Express.js
* GitHub REST API
* MongoDB
* Mongoose

### AI

* Large Language Models (LLMs)
* GPT-OSS 120B
* Qwen 3.6 27B
* ALLAM-2-7B
* LLM API integration

### Development

* Git
* GitHub
* npm

## Project Structure

```text
github-bug-fixer-v3/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── App.css
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── models/
│   │   └── Issue.js
│   ├── routes/
│   │   ├── analyze.js
│   │   ├── clone.js
│   │   ├── fix.js
│   │   ├── github.js
│   │   ├── accept.js
│   │   └── reject.js
│   ├── services/
│   │   ├── aiService.js
│   │   ├── impactScan.js
│   │   ├── parseFix.js
│   │   └── pathHelper.js
│   ├── index.js
│   ├── package.json
│   └── .env.example
│
├── test_diff_flow.js
├── package.json
├── package-lock.json
└── README.md
```

## Setup

### 1. Install dependencies

Install the root dependencies:

```powershell
npm install
```

Install the frontend dependencies:

```powershell
cd client
npm install
```

Install the backend dependencies:

```powershell
cd ..\server
npm install
```

### 2. Configure environment variables

Create:

```text
server/.env
```

using:

```text
server/.env.example
```

Configure the required environment variables:

```text
MONGO_URI=your_mongodb_connection_string
GITHUB_TOKEN=your_github_personal_access_token
GROQ_API_KEY=your_llm_api_key
PORT=5000
```

Do not commit the `.env` file to GitHub.

### 3. Start the backend

```powershell
cd server
npm start
```

### 4. Start the frontend

Open another terminal:

```powershell
cd client
npm start
```

The frontend will normally be available at:

```text
http://localhost:5173
```

## Usage

1. Enter the GitHub repository owner and repository name.
2. Fetch available GitHub issues.
3. Select an issue from the issue list.
4. Start the AI analysis workflow.
5. The system analyzes the issue and repository structure.
6. Review the identified file and AI-generated recommendation.
7. Compare the original and proposed code using the side-by-side diff.
8. Explicitly accept or reject the suggested fix.

## API and Backend Components

Important backend components include:

* `server/routes/github.js` — GitHub API integration
* `server/routes/clone.js` — repository cloning
* `server/routes/analyze.js` — issue and repository analysis
* `server/routes/fix.js` — code-fix generation
* `server/routes/accept.js` — accepting a proposed change
* `server/routes/reject.js` — rejecting a proposed change
* `server/services/aiService.js` — LLM integration
* `server/services/impactScan.js` — repository/file impact analysis
* `server/services/parseFix.js` — processing generated fixes
* `server/models/Issue.js` — MongoDB issue model

## Evaluation

The proposed research workflow can be evaluated using metrics such as:

* Accuracy
* Precision
* Recall
* Confusion Matrix

Evaluation can be performed by comparing the system's predicted faulty file against the actual file responsible for a reported issue.

Model-level comparisons can also be performed to study how different LLMs perform on issue analysis and code-fix recommendation tasks.

## Security Considerations

* API credentials are stored in environment variables.
* `.env` files are excluded from version control.
* GitHub repositories cloned for analysis are kept outside the tracked source files.
* AI-generated changes require explicit developer approval.
* The system does not automatically apply AI-generated fixes without developer interaction.

## Limitations

LLM-generated code recommendations may contain incorrect assumptions or introduce new issues. Repository size, issue quality, programming language, available context, and model capabilities can affect the accuracy of the analysis.

Different LLMs may also produce different file-localization and code-fix results for the same issue.

Therefore, the system is intended as an **AI-assisted developer tool**, rather than a replacement for human code review.

## Future Enhancements

Potential future improvements include:

* Automated benchmark datasets for faulty-file localization
* More comprehensive repository-wide dependency analysis
* Support for additional programming languages
* Improved context selection for large repositories
* Automated test generation for proposed fixes
* Code execution and validation in isolated environments
* Pull request generation after developer approval
* More detailed model comparison and evaluation
* Historical analysis of previously resolved GitHub issues

## Project Objective

The primary objective of this project is to investigate how Large Language Models can assist developers in GitHub issue triage, faulty-file localization, and code-fix recommendation while maintaining a human-in-the-loop workflow.

The system demonstrates a balance between AI-driven automation and developer control by requiring explicit review before a proposed change is accepted.
