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
  .setDescription("Show website with a custom message")
  .addStringOption(option =>
    option
      .setName("message")
      .setDescription("Custom message to display with the website link")
      .setRequired(false)
  ),

new SlashCommandBuilder()
  .setName("announce")
  .setDescription("Send announcement")
  .addStringOption(option =>
    option
      .setName("message")
      .setDescription("The message to send in the announcement")
      .setRequired(true)
  ),


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
          const url = process.env.WEBSITE_URL || "https://k7devs.com";

      const embed = new EmbedBuilder()
        .setTitle("🌐 Visit Our Website")
        .setDescription(`Check out our site: ${url}`)
        .setColor("#5865F2")
        .setFooter({ text: "Powered by Discord Bot" });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Visit Website")
          .setStyle(ButtonStyle.Link)
          .setURL(url)
      );

      return interaction.reply({ embeds: [embed], components: [row] });
    }


     if (interaction.commandName === "announce") {
      const msg = interaction.options.getString("message") || "No message provided";

      const embed = new EmbedBuilder()
        .setTitle("📢 Announcement")
        .setDescription(msg)
        .setColor("Green")
        .setFooter({ text: `Announcement by ${interaction.user.tag}` })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    return interaction.reply("❓ Unknown command");
  } catch (err) {
    console.log("❌ Interaction error:", err);
    if (!interaction.replied) {
      return interaction.reply({ content: "⚠️ Something went wrong.", ephemeral: true });
    }
  }
});


// =====================================================
// LOGIN
// =====================================================

client.login(process.env.TOKEN);
