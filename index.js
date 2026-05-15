import dotenv from "dotenv";
dotenv.config();

import express from "express";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} from "discord.js";

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

console.log("🚀 BOT STARTING...");


// =====================================================
// EXPRESS SERVER
// =====================================================

const app = express();

app.get("/", (req, res) => {
  res.send("✅ Bot is running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🌐 Web server running on", PORT);
});


// =====================================================
// DISCORD CLIENT
// =====================================================

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});


// =====================================================
// SLASH COMMANDS (KEEP SIMPLE)
// =====================================================

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot"),

  new SlashCommandBuilder()
    .setName("website")
    .setDescription("Show website"),

  new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Test announce")
].map(c => c.toJSON());


// =====================================================
// REGISTER COMMANDS (FORCE REFRESH)
// =====================================================

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

async function register() {
  try {
    console.log("🚀 Registering commands...");

    const data = await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("✅ Commands registered:", data.length);
  } catch (err) {
    console.log("❌ Command error:", err);
  }
}

register();


// =====================================================
// READY EVENT
// =====================================================

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});


// =====================================================
// INTERACTIONS (DEBUG SAFE)
// =====================================================

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  console.log("👉 COMMAND RECEIVED:", interaction.commandName);

  try {

    if (interaction.commandName === "ping") {
      return interaction.reply("🏓 Pong!");
    }

    if (interaction.commandName === "website") {
      return interaction.reply("🌐 " + (process.env.WEBSITE_URL || "No website set"));
    }

    if (interaction.commandName === "announce") {
      return interaction.reply("📢 Announce command works");
    }

    return interaction.reply("❓ Unknown command");

  } catch (err) {
    console.log("❌ Interaction error:", err);
  }
});


// =====================================================
// LOGIN
// =====================================================

client.login(process.env.TOKEN);
