import dotenv from "dotenv";
dotenv.config();

import express from "express";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} from "discord.js";

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

console.log("🚀 Bot starting...");


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
    .setName("announce")
    .setDescription("Send announcement")
    .addStringOption(option =>
      option
        .setName("message")
        .setDescription("Message to send")
        .setRequired(true)
    )
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

    console.log("✅ Commands ready");
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
// COMMAND HANDLER (100% SAFE)
// =====================================================

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {

    // ======================
    // /ping
    // ======================
    if (interaction.commandName === "ping") {
      return interaction.reply("🏓 Pong!");
    }

    // ======================
    // /website
    // ======================
    if (interaction.commandName === "website") {
      await interaction.deferReply();

      const url = process.env.WEBSITE_URL || "No website set";

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🌐 Website")
            .setDescription(url)
            .setColor("#5865F2")
        ]
      });
    }

    // ======================
    // /announce
    // ======================
    if (interaction.commandName === "announce") {
      await interaction.deferReply();

      const msg = interaction.options.getString("message");

      if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        return interaction.editReply("❌ You need Administrator permission.");
      }

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("📢 Announcement")
            .setDescription(msg)
            .setColor("Green")
            .setTimestamp()
        ]
      });
    }

  } catch (err) {
    console.log("Interaction error:", err);

    if (interaction.deferred || interaction.replied) {
      return interaction.editReply("⚠️ Something went wrong.");
    } else {
      return interaction.reply("⚠️ Something went wrong.");
    }
  }
});


// =====================================================
// LOGIN
// =====================================================

client.login(process.env.TOKEN);
