import dotenv from "dotenv";
dotenv.config();

import express from "express";
import axios from "axios";
import mongoose from "mongoose";

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

console.log("🚀 BOT STARTING...");


// =====================================================
// MONGODB (SAFE NON-BLOCKING)
// =====================================================

let dbConnected = false;

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10
    });

    dbConnected = true;
    console.log("✅ MongoDB Connected");
  } catch (err) {
    dbConnected = false;
    console.log("❌ MongoDB failed (bot still runs):", err.message);
  }
}

connectDB();


// Simple monitoring schema
const monitorSchema = new mongoose.Schema({
  status: String,
  checkedAt: Date
});

const Monitor = mongoose.models.Monitor ||
  mongoose.model("Monitor", monitorSchema);


// =====================================================
// EXPRESS SERVER
// =====================================================

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Bot Dashboard Running");
});

app.get("/status", (req, res) => {
  res.json({
    status: "online",
    db: dbConnected,
    bot: client?.user?.tag || "starting"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("🌐 Web server running on port", PORT);
});


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
    .setDescription("Check bot latency"),

  new SlashCommandBuilder()
    .setName("website")
    .setDescription("Show website link"),

  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Check website status")
].map(cmd => cmd.toJSON());


// =====================================================
// REGISTER COMMANDS
// =====================================================

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

async function registerCommands() {
  try {
    console.log("🚀 Registering slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("✅ Slash commands registered");
  } catch (err) {
    console.log("❌ Command error:", err.message);
  }
}

registerCommands();


// =====================================================
// READY EVENT
// =====================================================

client.once("ready", () => {
  console.log("✅ Logged in as:", client.user.tag);
});


// =====================================================
// INTERACTIONS
// =====================================================

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "status") {
  await interaction.deferReply();

  try {
    const res = await axios.get(process.env.WEBSITE_URL, {
      timeout: 5000
    });

    if (dbConnected) {
      await Monitor.create({
        status: res.status === 200 ? "ONLINE" : "ISSUE",
        checkedAt: new Date()
      });
    }

    return interaction.editReply(
      res.status === 200 ? "🟢 Website Online" : "🟠 Issue"
    );

  } catch (err) {
    if (dbConnected) {
      await Monitor.create({
        status: "OFFLINE",
        checkedAt: new Date()
      });
    }

    return interaction.editReply("🔴 Website Offline");
  }
}


// =====================================================
// LOGIN (LAST STEP)
// =====================================================

client.login(process.env.TOKEN);
