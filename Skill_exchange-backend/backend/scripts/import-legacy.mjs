import mysql from 'mysql2/promise';
import { readFile } from 'node:fs/promises';
import { saveWorkspaceProfile, workspaceProfile } from '../lib/workspace.mjs';

const file = process.argv[2];
if (!file) throw new Error('Supply the full path to the old app/server/data/db.json file.');
const { users } = JSON.parse(await readFile(file, 'utf8'));
if (!Array.isArray(users)) throw new Error('Expected a legacy file with a users array.');

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});
let imported = 0;
try {
  await connection.beginTransaction();
  for (const user of users) {
    if (!/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(user.passwordHash)) {
      throw new Error('A legacy account has an invalid bcrypt password hash.');
    }
    const profile = workspaceProfile.parse(user);
    const email = user.email.trim().toLowerCase();
    const [existing] = await connection.execute('SELECT id FROM students WHERE email=?', [email]);
    if (existing.length) continue;
    const [result] = await connection.execute('INSERT INTO students(name,email,password_hash) VALUES(?,?,?)',
      [profile.name, email, user.passwordHash]);
    await saveWorkspaceProfile(connection, result.insertId, profile);
    imported++;
  }
  await connection.commit();
  console.log(`Imported ${imported} account(s). Skipped ${users.length - imported} matching email address(es).`);
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
