const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = "!crg";

const config = require("./config.json");
const mg = require('mongodb').MongoClient;
const url = 'mongodb://127.0.0.1:27017';
let clientDb;

mg.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err, client) => {
  if (err) {
      return console.log(err);
  }
  clientDb = client;
});

client.on("ready", function(){
  console.log("Bot connected");
})

client.on("message", function (msg){
  if(!msg.content.startsWith(prefix)) return;

  const cmd = msg.content.slice(prefix.length);
  const args = cmd.split(' ');

  if(args[1] == "newuser"){
    newUser(args[2], msg);
  }else if(args[1] == "userlist"){
    userList(msg);
  }else if(args[1] == "++"){
    let user = args[2].substring(3, args[2].length-1);
    console.log(user);
    addCringeScore(user, msg);
  }
})

function newUser(userName, msg){
  const db = clientDb.db('crg');
  const collection = db.collection('users');
  collection.insertOne({name: msg.author.id, score: 0, trophies: 0, level: 0}, (err, result) => {
    if(err) msg.reply("Error");
    else msg.reply("New user created")
  })
}

function userList(msg){
  let reply = "";

  const db = clientDb.db('crg');
  const collection = db.collection('users');
  collection.find().toArray((err, items) => {
    items.forEach(user => {
      reply += "<@" + user.name + ">, ";
      console.log(reply);
      console.log(user.name);
    });
    msg.reply(reply);
  })
}

async function getCringeScore(target){
  const db = clientDb.db('crg');
  const collection = db.collection('users');

  await collection.find({name: target}).toArray((err, user) => {
    console.log(user[0].score);
    return user[0].score;
  })
}

async function addCringeScore(target, msg){
  const db = clientDb.db('crg');
  const collection = db.collection('users');

  await collection.updateOne({name : target}, {'$inc': {score: 1}}, (err, item) => {
    console.log("New score for " + target);
    
  })

  let score = await getCringeScore(target);

  msg.reply("<@" + target + "> score : " + score);
}

client.login(config.BOT_TOKEN);