import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import mysql from 'mysql2/promise';
import {MongoClient} from 'mongodb';
import {execFileSync} from 'node:child_process';
const backend=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const nodeExe=path.join(path.dirname(backend),'runtime/node/node.exe');
try{
  const pid=Number(await fs.readFile(path.join(backend,'work/backend.pid'),'utf8'));
  if(Number.isSafeInteger(pid)&&pid>0){
    const actual=execFileSync('powershell.exe',['-NoProfile','-Command',`(Get-Process -Id ${pid} -ErrorAction SilentlyContinue).Path`],{encoding:'utf8',windowsHide:true}).trim();
    if(actual.toLowerCase()===nodeExe.toLowerCase())process.kill(pid);
  }
}catch(e){if(e.code!=='ENOENT'&&e.code!=='ESRCH')console.log('Web server already stopped or could not be identified.');}
try{const secrets=JSON.parse(await fs.readFile(path.join(backend,'work/portable-secrets.json'),'utf8'));const c=await mysql.createConnection({host:'127.0.0.1',port:13306,user:'root',password:secrets.mysqlRoot});try{await c.query('SHUTDOWN');}catch(e){if(!['PROTOCOL_CONNECTION_LOST','ECONNRESET'].includes(e.code))throw e;}finally{await c.end().catch(()=>{});}console.log('MySQL stopped safely.');}catch(e){console.log('MySQL: '+e.message);}
try{const admin=JSON.parse(await fs.readFile(path.join(backend,'work/mongo-admin.json'),'utf8'));const c=new MongoClient(`mongodb://${admin.user}:${admin.password}@127.0.0.1:27028/admin`,{serverSelectionTimeoutMS:3000});try{await c.connect();await c.db('admin').command({shutdown:1});}catch(e){if(!['MongoNetworkError','MongoServerSelectionError'].includes(e.name))throw e;}finally{await c.close();}console.log('MongoDB stopped safely.');}catch(e){console.log('MongoDB: '+e.message);}
console.log('Saved database files were preserved.');
