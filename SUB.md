# Submission Guide — DevStakes

Follow the steps below carefully to submit your project. Incorrect submissions may not be considered for judging.

---

## Step-by-Step Submission Process

### 1. Fork this Repository

Click the **Fork** button at the top-right of this repository to create a copy under your GitHub account.

### 2. Clone your Fork

```bash
git clone https://github.com/<your-username>/devstakes.git
cd devstakes
```

### 3. Create a Folder for your Team

Inside the repo root, create a folder named exactly after your team name. Use lowercase letters and hyphens — no spaces.

```
devstakes/
└── teams/
    └── your-team-name/
        ├── README.md        ← required
        └── ... (your project files)
```

> All your project files must live inside `teams/your-team-name/`. Do not place files outside this folder.

### 4. Add a README inside your Team Folder

Your team folder **must** contain a `README.md` with the following details:

```markdown
# Project Name

## Team Name
Your team name here

## Team Members
- Name 1 (GitHub: @username)
- Name 2 (GitHub: @username)
- Name 3 (GitHub: @username)
- Name 4 (GitHub: @username)
- Name 5 (GitHub: @username) — optional

## Idea Chosen
(Name of the idea — e.g., "Smart Expense Splitter" or "Custom: <your idea name>")

## Problem Statement
Brief description of the problem you are solving.

## Tech Stack
- React
- (any other libraries/frameworks/tools used)

## Implementation Details
Describe your approach — architecture decisions, key features, algorithms used, state management strategy, etc.

## How to Run Locally
Steps to clone and run the project on a local machine.

## Live Demo
Link to deployed app (Vercel / Netlify / etc.)

## Screenshots / Demo
(Include a demo video or screenshots showcasing your app's features)
```

### 5. Commit and Push to your Fork

```bash
git add teams/your-team-name/
git commit -m "feat: add submission for <your-team-name>"
git push origin main
```

### 6. Open a Pull Request

1. Go to your forked repository on GitHub.
2. Click **"Contribute" → "Open pull request"**.
3. Set the **base repository** to the original `devstakes` repo and **base branch** to `main`.
4. Use the following PR title format:

   ```
   [Submission] <Team Name> — <Idea Name>
   ```

   Example:
   ```
   [Submission] Team Nebula — Smart Expense Splitter
   ```

5. In the PR description, include:
   - Team name and members
   - Idea chosen
   - Live demo link
   - Any notes for judges

6. Submit the pull request.

---

## Checklist Before Submitting

- [ ] Forked the repo and created `teams/your-team-name/` folder
- [ ] All project code is inside your team folder
- [ ] `README.md` inside the team folder is complete with all required sections
- [ ] Live deployment link is working and included
- [ ] PR title follows the `[Submission] Team Name — Idea Name` format
- [ ] PR description includes team members and demo link
- [ ] Git history has meaningful commit messages

---

## Important Notes

- Only **one PR per team** is allowed. If you need to update your submission, push additional commits to the same branch — do not open a new PR.
- The PR must be opened **before the end of Day-3** to be considered.
- PRs that do not follow the folder structure or are missing the team README will be disqualified from judging.

---

