import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const backend=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.dirname(backend),node=path.join(root,'runtime/node/node.exe'),work=path.join(backend,'work');
fs.mkdirSync(path.join(work,'logs'),{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function listening(port){return new Promise(resolve=>{const s=net.createConnection({host:'127.0.0.1',port});s.setTimeout(500);s.once('connect',()=>{s.destroy();resolve(true);});s.once('error',()=>{s.destroy();resolve(false);});s.once('timeout',()=>{s.destroy();resolve(false);});});}
async function waitPort(port){for(let i=0;i<90;i++){if(await listening(port))return;await pause(500);}throw new Error(`Service did not start on port ${port}. See backend/work/logs.`);}
function run(exe,args,label){return new Promise((resolve,reject)=>{const p=spawn(exe,args,{cwd:backend,windowsHide:true,stdio:'inherit'});p.once('error',reject);p.once('exit',code=>code===0?resolve():reject(new Error(`${label} failed (exit ${code}). Read the message above.`)));});}
function background(exe,args,label){
  const stdout=fs.openSync(path.join(work,'logs',label+'.log'),'a'),stderr=fs.openSync(path.join(work,'logs',label+'-error.log'),'a');
  const p=spawn(exe,args,{cwd:backend,windowsHide:true,detached:true,stdio:['ignore',stdout,stderr]});
  p.on('error',e=>console.error(`${label}: ${e.message}`));p.unref();fs.closeSync(stdout);fs.closeSync(stderr);
  fs.writeFileSync(path.join(work,label+'.pid'),String(p.pid));
}
const startupLock=path.join(work,'startup.lock');
try {
  fs.mkdirSync(startupLock);
} catch (error) {
  console.error(error.code === 'EEXIST' ? 'Startup is already in progress. Wait for it to finish.' : error.message);
  process.exit(1);
}
try{
  console.log('\nSKILLSWAP FOR WINDOWS\nMySQL + MongoDB + Next.js API\n');
  await run(node,['scripts/portable-prepare.mjs'],'Configuration');
  const mysqlRoot=path.join(root,'runtime/mysql'),mysqlExe=path.join(mysqlRoot,'bin/mysqld.exe'),mysqlData=path.join(work,'mysql-data');
  if(!fs.existsSync(path.join(mysqlData,'mysql'))){
    if(await listening(13306))throw new Error('Port 13306 is already occupied. Stop that service before initializing this demo.');
    fs.mkdirSync(mysqlData,{recursive:true});console.log('First run: initializing MySQL. This can take a minute…');
    await run(mysqlExe,['--no-defaults','--initialize-insecure',`--basedir=${mysqlRoot}`,`--datadir=${mysqlData}`,'--console'],'MySQL initialization');
  }
  if(!await listening(13306))background(mysqlExe,['--no-defaults',`--basedir=${mysqlRoot}`,`--datadir=${mysqlData}`,'--port=13306','--bind-address=127.0.0.1','--mysqlx=0','--skip-log-bin','--console'],'mysql');
  await waitPort(13306);
  await run(node,['--env-file=.env','scripts/portable-mysql-init.mjs',...(!fs.existsSync(path.join(work,'mysql-configured'))?['--fresh']:[])],'MySQL account setup');
  fs.writeFileSync(path.join(work,'mysql-configured'),'ready');
  const mongoData=path.join(work,'mongo-data');fs.mkdirSync(mongoData,{recursive:true});
  if(!await listening(27028))background(path.join(root,'runtime/mongodb/bin/mongod.exe'),['--auth','--bind_ip','127.0.0.1','--port','27028','--dbpath',mongoData,'--logpath',path.join(work,'logs/mongodb-server.log'),'--logappend'],'mongodb');
  await waitPort(27028);
  await run(node,['--env-file=.env','scripts/setup-mongo.mjs'],'MongoDB setup');
  if(!fs.existsSync(path.join(work,'seed-complete'))){
    await run(node,['--env-file=.env','scripts/setup-db.mjs'],'MySQL schema');
    await run(node,['--env-file=.env','scripts/seed-demo.mjs'],'Demo sessions');
    await run(node,['--env-file=.env','scripts/seed-resources.mjs'],'MongoDB resources');
    fs.writeFileSync(path.join(work,'seed-complete'),new Date().toISOString());
  }
  await run(node,['--env-file=.env','scripts/setup-workspace.mjs'],'Workspace schema');
  process.env.SKILLSWAP_LOCAL_HTTP='1';
  process.env.NEXT_TELEMETRY_DISABLED='1';
  if(!await listening(3000))background(node,['--env-file=.env','node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3000'],'backend');
  await waitPort(3000);
  const response=await fetch('http://127.0.0.1:3000/api/skills');
  if(!response.ok||!Array.isArray(await response.json()))throw new Error('Backend health check failed. Port 3000 may belong to another application.');
  console.log('\nREADY: http://127.0.0.1:3000/\nUse STOP-SKILLSWAP.bat when finished.');
}catch(e){console.error('\nSETUP FAILED: '+e.message+'\n');process.exitCode=1;}finally{fs.rmdirSync(startupLock);}

