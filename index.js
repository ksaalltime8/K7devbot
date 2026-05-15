console.log("🚀 APP STARTING...");

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

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);


// =====================================================
// EXPRESS SERVER
// =====================================================

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Dashboard API Running");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Server running on port ${PORT}`);
});


// =====================================================
// MONGODB (SAFE)
// =====================================================

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.log("❌ MongoDB Error:", err.message);
  }
}

connectDB();


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
  new SlashCommandBuilder().setName("ping").setDescription("Ping bot"),
  new SlashCommandBuilder().setName("website").setDescription("Website link"),
  new SlashCommandBuilder().setName("status").setDescription("Website status"),
  new SlashCommandBuilder().setName("stats").setDescription("DB stats")
].map(c => c.toJSON());


// =====================================================
// REGISTER COMMANDS
// =====================================================

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("🚀 Registering commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("✅ Commands registered");
  } catch (err) {
    console.log("❌ Command error:", err.message);
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

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    return interaction.reply("🏓 Pong!");
  }

  if (interaction.commandName === "website") {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🌐 Website")
          .setDescription(process.env.WEBSITE_URL)
          .setColor("Blue")
      ]
    });
  }

  if (interaction.commandName === "status") {
    try {
      const res = await axios.get(process.env.WEBSITE_URL);
      return interaction.reply(
        res.status === 200 ? "🟢 Online" : "🟠 Issue"
      );
    } catch {
      return interaction.reply("🔴 Offline");
    }
  }

  if (interaction.commandName === "stats") {
    const count = await mongoose.connection.db
      .collection("monitors")
      .countDocuments();

    return interaction.reply(`📊 Logs: ${count}`);
  }
});


// =====================================================
// WEBSITE MONITORING
// =====================================================

async function monitorWebsite() {
  try {
    const res = await axios.get(process.env.WEBSITE_URL);

    await mongoose.connection.db
      .collection("monitors")
      .insertOne({
        status: res.status === 200 ? "ONLINE" : "ISSUE",
        checkedAt: new Date()
      });

    console.log("🌐 ONLINE");
  } catch {
    await mongoose.connection.db
      .collection("monitors")
      .insertOne({
        status: "OFFLINE",
        checkedAt: new Date()
      });

    console.log("🔴 OFFLINE");
  }
}

setInterval(monitorWebsite, 300000);


// =====================================================
// LOGIN
// =====================================================

client.login(process.env.TOKEN);
