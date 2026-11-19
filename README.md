# SkillSwap — Student Skill Exchange Platform

SkillSwap is a peer-learning platform where students can share what they know and find classmates who can teach what they want to learn. Students create profiles, list skills they offer or want to learn, discover compatible peers, arrange learning sessions, and review completed sessions. The resource library also lets students share learning materials such as articles, videos, exercises, and notes.

## Features

- Student registration, login, and profile management
- Lists of skills to teach and skills to learn
- Student discovery and skill-based match suggestions
- Weekly availability and session booking, acceptance, cancellation, and completion
- Reviews for completed sessions
- A searchable learning-resource library with tags, filters, and resource statistics
- SQL and NoSQL data storage, with student and skill records connected to learning resources

## How to run the complete project on Windows

The root launcher starts the integrated application, including its React interface, API, MySQL database, and MongoDB resource library.

1. Clone the repository or extract the complete project folder. If using a ZIP, extract it fully; do not run the launcher from inside the ZIP viewer. Use a folder where your account can create files.
2. On Windows 10 or 11 (64-bit), double-click `START-SKILLSWAP.bat`. You can also run it from PowerShell:

   ```powershell
   .\START-SKILLSWAP.bat
   ```

3. On first launch, the app initializes its local databases and loads demo data. This can take a minute. When startup completes, open [http://127.0.0.1:3000](http://127.0.0.1:3000).
4. Sign in with the local demo account or register a new account:

   ```text
   Email:    chandana@example.com
   Password: Student@123
   ```

5. Add skills and availability in your profile, find peers in Discover, arrange sessions, and explore the Resource Library.
6. When finished, double-click `STOP-SKILLSWAP.bat` to stop the local services.

The Windows package includes Node.js and the MySQL and MongoDB server binaries. For this run method, you do not need to install Node.js, npm, Docker, or either database separately, and the app does not need internet access after the project files are available. Keep the project folder for future runs; its local database files are stored under `Skill_exchange-backend/backend/work`.

### Windows run requirements

- Windows 10 or 11, 64-bit
- A writable location for the extracted project and its local database files
- Ports `3000`, `13306`, and `27028` available on `127.0.0.1`

If startup fails, check the message in the launcher window and the logs under `Skill_exchange-backend/backend/work/logs`. Close other applications using the ports above and try again. Do not delete the `work` folder if you want to keep the local demo data. Do not commit the generated `.env` file or anything in `work`.

## Technologies used

| Part | Technologies and purpose |
|---|---|
| Frontend | React 18, Vite 6, React Router, Axios, Lucide React, and CSS. The source is in `app/client`; its build is served by the integrated application. |
| Integrated application and API | Node.js and Next.js 16 App Router. JSON route handlers provide authentication, profiles, skills, matching, availability, sessions, reviews, and resource endpoints. Zod validates inputs; `jose` handles signed sessions; `bcryptjs` hashes passwords. |
| Relational database | MySQL 8 stores students, skills, availability, sessions, reviews, and session audit records. The database uses keys, constraints, indexes, views, stored procedures, triggers, joins, and transactions. `mysql2` connects the application to MySQL. |
| Document database | MongoDB 8 stores learning-resource documents with tags and optional metadata. Text indexes support keyword search, and aggregation pipelines provide resource statistics. The `mongodb` driver connects the application to MongoDB. |
| Standalone starter API | `app/server` contains an Express 4 REST API with CORS, JWT authentication, bcrypt password hashing, and local JSON-file persistence. It is a separate starter implementation; the root Windows launcher runs the integrated Next.js application. |

The integrated API uses MySQL as the source of truth for students and skills. Resource documents are stored in MongoDB and refer to their authors and skills through MySQL IDs. The resource search is keyword-based, not semantic search.

## Repository layout

```text
app/client/                         React frontend source
app/server/                         Standalone Express API starter
Skill_exchange-backend/backend/     Integrated Next.js app, APIs, databases, scripts, and docs
Skill_exchange-backend/PRESENTATION/Database diagrams and presentation materials
Skill_exchange-backend/runtime/     Bundled Windows Node.js, MySQL, and MongoDB runtimes
START-SKILLSWAP.bat                 Start the integrated Windows demo
STOP-SKILLSWAP.bat                  Stop the integrated Windows demo
```

## Running and developing from source

The root Windows launcher is the simplest way to run the complete integrated app. For development on a separately configured machine, the integrated backend requires Node.js 20.9 or newer, MySQL 8.0.16 or newer, and MongoDB for the resource library. Install the npm dependencies, configure a private `.env` from `Skill_exchange-backend/backend/.env.example`, initialize the databases and demo data, then run the Next.js app from `Skill_exchange-backend/backend` with `npm run dev`. The database setup details and commands are in [`Skill_exchange-backend/backend/README.md`](Skill_exchange-backend/backend/README.md).

The React frontend source is in `app/client`. From that directory, install its dependencies with `npm ci` and build it with `npm run build`; Vite writes the built frontend to `Skill_exchange-backend/backend/public/sw`.

## API and database documentation

- [API routes and behavior](Skill_exchange-backend/backend/docs/API.md)
- [SQL and MongoDB design](Skill_exchange-backend/backend/docs/SQL-and-MongoDB.md)
- [Database ER diagram](Skill_exchange-backend/backend/docs/ER-diagram.md)
- [Backend setup and test commands](Skill_exchange-backend/backend/README.md)

The project is intended as a local academic demonstration. Review the backend documentation before exposing it to a public network; additional production security and operations work would be needed.

## Contributors

- **Chandana Rajeswari P** — PES2UG24AM043
- **Arnav (arn)** — PES2UG24AM027
