SKILLSWAP FOR WINDOWS

1. Extract the entire ZIP to a short path you can write to, such as
   C:\Users\YourName\SkillSwap. Use a Windows x64 computer.
2. Double-click START-SKILLSWAP.bat. First startup initializes MySQL and
   MongoDB and may take a minute. The ZIP includes Node.js, both database
   servers, and built application files. Startup works without npm or internet.
3. Open http://127.0.0.1:3000/ if the browser does not open automatically.
   Register with a password of at least 8 characters, or use the local demo
   account chandana@example.com with password Student@123.
4. Use My profile to add teaching and learning skills and weekly availability.
   The availability presets use UTC. In Discover students, choose Book a session
   on a teacher's card. The booking form accepts your local time and displays
   the teacher's weekly availability in UTC. In Sessions, the teacher accepts
   and completes the booking and the learner can then review it.
   Resource library uses the same account and stores learning resources in
   MongoDB with links to MySQL students and skills.
5. Double-click STOP-SKILLSWAP.bat when finished. Keep this folder for future
   runs. Databases and credentials are created locally in
   Skill_exchange-backend\backend\work and Skill_exchange-backend\backend\.env.

Existing accounts from SkillSwap-FIX
Start the new app first. Drag the old app\server\data\db.json onto
IMPORT-LEGACY-ACCOUNTS.bat. It copies profiles and password hashes without
changing the old file. Matching email addresses are skipped. Sign in with
your existing password. Use a fresh extraction for the integrated package.

Troubleshooting
Ports 3000, 13306 and 27028 are used on 127.0.0.1. If startup fails, read the
message in the startup window and the logs in
Skill_exchange-backend\backend\work\logs. Keep this demo on the local computer.
The original Express source and backend presentation files are included for
reference. The Windows launchers use the integrated Next.js application.
