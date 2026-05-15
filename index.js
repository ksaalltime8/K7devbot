// =====================================================
// ADVANCED DISCORD DEV WEBSITE BOT
// Features:
// ✅ Slash Commands
// ✅ Website Monitoring
// ✅ Dashboard API
// ✅ MongoDB Database
// ✅ Express Backend
// =====================================================



// =====================================================
// 1. INSTALL
// =====================================================

// npm init -y

// npm install discord.js dotenv express mongoose axios



// =====================================================
// 2. package.json
// =====================================================

{
  "name": "advanced-dev-bot",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
}



// =====================================================
// 3. .env
// =====================================================

TOKEN=YOUR_BOT_TOKEN
CLIENT_ID=
GUILD_ID=

MONGO_URI=

WEBSITE_URL=https://k7devs.com

PORT=3000



// =====================================================
// 4. index.js
// =====================================================

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import axios from "axios";

import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";



// =====================================================
// EXPRESS SERVER
// =====================================================

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("✅ Dashboard API Running");
});

app.listen(process.env.PORT, () => {
  console.log(`🌐 Dashboard running on port ${process.env.PORT}`);
});



// =====================================================
// MONGODB
// =====================================================

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("✅ MongoDB Connected");
})
.catch(err => {
  console.log(err);
});



// =====================================================
// DATABASE MODEL
// =====================================================

const monitorSchema = new mongoose.Schema({
  status: String,
  checkedAt: Date
});

const Monitor = mongoose.model(
  "Monitor",
  monitorSchema
);



// =====================================================
// DISCORD CLIENT
// =====================================================

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});



// =====================================================
// SLASH COMMANDS
// =====================================================

const commands = [

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping command"),

  new SlashCommandBuilder()
    .setName("website")
    .setDescription("Website link"),

  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Website status"),

  new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Database stats")

].map(command => command.toJSON());



// =====================================================
// REGISTER COMMANDS
// =====================================================

const rest = new REST({ version: "10" })
.setToken(process.env.TOKEN);

(async () => {

  try {

    console.log("🚀 Registering Slash Commands");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("✅ Slash Commands Registered");

  } catch (err) {
    console.log(err);
  }

})();



// =====================================================
// READY EVENT
// =====================================================

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});



// =====================================================
// INTERACTIONS
// =====================================================

client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;



  // =====================================================
  // /ping
  // =====================================================

  if (interaction.commandName === "ping") {

    return interaction.reply("🏓 Pong!");

  }



  // =====================================================
  // /website
  // =====================================================

  if (interaction.commandName === "website") {

    const embed = new EmbedBuilder()
      .setTitle("🌐 Website")
      .setDescription(process.env.WEBSITE_URL)
      .setColor("#5865F2");

    return interaction.reply({
      embeds: [embed]
    });

  }



  // =====================================================
  // /status
  // =====================================================

  if (interaction.commandName === "status") {

    try {

      const response = await axios.get(
        process.env.WEBSITE_URL
      );

      if (response.status === 200) {

        return interaction.reply(
          "🟢 Website Online"
        );

      }

      return interaction.reply(
        "🟠 Website Issue"
      );

    } catch {

      return interaction.reply(
        "🔴 Website Offline"
      );

    }

  }



  // =====================================================
  // /stats
  // =====================================================

  if (interaction.commandName === "stats") {

    const count = await Monitor.countDocuments();

    const embed = new EmbedBuilder()
      .setTitle("📊 Monitoring Stats")
      .addFields(
        {
          name: "Checks Saved",
          value: `${count}`
        }
      )
      .setColor("#00b894");

    return interaction.reply({
      embeds: [embed]
    });

  }

});



// =====================================================
// WEBSITE MONITORING
// =====================================================

async function monitorWebsite() {

  try {

    const response = await axios.get(
      process.env.WEBSITE_URL
    );

    const status =
      response.status === 200
      ? "ONLINE"
      : "ISSUE";

    console.log(`🌐 ${status}`);

    await Monitor.create({
      status,
      checkedAt: new Date()
    });

  } catch {

    console.log("🔴 OFFLINE");

    await Monitor.create({
      status: "OFFLINE",
      checkedAt: new Date()
    });

  }

}



// =====================================================
// RUN EVERY 5 MINUTES
// =====================================================

setInterval(monitorWebsite, 300000);



// =====================================================
// DASHBOARD API ROUTES
// =====================================================

// GET ALL MONITOR LOGS

app.get("/api/logs", async (req, res) => {

  const logs = await Monitor
    .find()
    .sort({ checkedAt: -1 })
    .limit(20);

  res.json(logs);

});



// WEBSITE STATUS

app.get("/api/status", async (req, res) => {

  const latest = await Monitor
    .findOne()
    .sort({ checkedAt: -1 });

  res.json(latest);

});



// =====================================================
// LOGIN
// =====================================================

client.login(process.env.TOKEN);



// =====================================================
// FEATURES INCLUDED
// =====================================================

// ✅ Slash Commands
// ✅ MongoDB Database
// ✅ Dashboard API
// ✅ Website Monitoring
// ✅ Monitoring Logs
// ✅ Discord Bot
// ✅ Express Backend
// ✅ Analytics Endpoint



// =====================================================
// API ENDPOINTS
// =====================================================

// GET:
// http://localhost:3000/api/status

// GET:
// http://localhost:3000/api/logs



// =====================================================
// EXAMPLE FRONTEND DASHBOARD
// =====================================================

// Create dashboard.html

/*
<!DOCTYPE html>
<html>

<head>
  <title>Dev Dashboard</title>
</head>

<body>

<h1>Website Monitor</h1>

<div id="status"></div>

<script>

async function loadStatus() {

  const response =
    await fetch(
      "http://localhost:3000/api/status"
    );

  const data = await response.json();

  document.getElementById("status")
  .innerHTML = `
    <h2>Status: ${data.status}</h2>
    <p>${data.checkedAt}</p>
  `;
}

loadStatus();

</script>

</body>
</html>
*/



// =====================================================
// NEXT UPGRADE IDEAS
// =====================================================

// 🔥 Discord OAuth Login
// 🔥 Real Dashboard UI
// 🔥 React Frontend
// 🔥 Live Charts
// 🔥 Premium Plans
// 🔥 AI Assistant
// 🔥 Ticket System
// 🔥 VPS Deployment
// 🔥 Docker
// 🔥 Redis Cache
// 🔥 Auto Deploy Hooks
// 🔥 GitHub Webhooks