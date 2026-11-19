import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {MongoClient} from 'mongodb';
import {initializeResources} from '../lib/mongo.mjs';

const endpoint=(process.env.MONGODB_HOST||'127.0.0.1')+':'+(process.env.MONGODB_PORT||'27018');
const adminFile=new URL('../work/mongo-admin.json',import.meta.url);
let admin;
try{admin=JSON.parse(await fs.readFile(adminFile,'utf8'));}
catch(e){if(e.code!=='ENOENT')throw e;admin={user:'skillswap_admin',password:crypto.randomBytes(30).toString('hex')};await fs.mkdir(new URL('../work/',import.meta.url),{recursive:true});await fs.writeFile(adminFile,JSON.stringify(admin),{mode:0o600});}
const adminUri=`mongodb://${encodeURIComponent(admin.user)}:${encodeURIComponent(admin.password)}@${endpoint}/admin`;
let root=new MongoClient(adminUri,{serverSelectionTimeoutMS:5000});
try{await root.connect();await root.db('admin').command({ping:1});}
catch(e){
  await root.close();
  const bootstrap=new MongoClient(`mongodb://${endpoint}`,{serverSelectionTimeoutMS:5000});
  try{
    await bootstrap.connect();
    await bootstrap.db('admin').command({createUser:admin.user,pwd:admin.password,roles:[{role:'root',db:'admin'}]});
    console.log('Initialized authenticated local MongoDB administrator.');
  }finally{await bootstrap.close();}
  root=new MongoClient(adminUri,{serverSelectionTimeoutMS:5000});await root.connect();
}
try{
  let uri=process.env.MONGODB_URI;
  if(!uri){
    const password=crypto.randomBytes(30).toString('hex');
    const appDb=root.db('skill_resources');
    const existing=await appDb.command({usersInfo:'skillapp'});
    if(existing.users.length)throw new Error('MongoDB skillapp already exists but MONGODB_URI is missing. Restore the local .env configuration.');
    await appDb.command({createUser:'skillapp',pwd:password,roles:[{role:'readWrite',db:'skill_resources'},{role:'dbAdmin',db:'skill_resources'}]});
    uri=`mongodb://skillapp:${password}@${endpoint}/skill_resources?authSource=skill_resources`;
    await fs.appendFile(new URL('../.env',import.meta.url),`\nMONGODB_URI=${uri}\nMONGODB_DATABASE=skill_resources\n`);
  }
  const app=new MongoClient(uri,{serverSelectionTimeoutMS:5000});
  try{await app.connect();await initializeResources(app.db(process.env.MONGODB_DATABASE||'skill_resources'));console.log('MongoDB ready: learning_resources validator and four indexes installed. Credentials are stored only in ignored local configuration.');}
  finally{await app.close();}
}finally{await root.close();}

