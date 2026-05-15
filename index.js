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
// EXPRESS SERVER (KEEP BOT ALIVE)
// =====================================================
const app = express();

app.get("/", (req, res) => {
  res.send("✅ Bot is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🌐 Web server running on", PORT));

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
  new SlashCommandBuilder().setName("website").setDescription("Show website"),
  new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Send an announcement")
    .addStringOption(opt =>
      opt.setName("message").setDescription("Message to send").setRequired(true)
    )
].map(c => c.toJSON());

// =====================================================
// REGISTER COMMANDS
// =====================================================
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    const data = await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log("✅ Commands registered:", data.length);
  } catch (err) {
    console.log("❌ Command registration error:", err);
  }
})();

// =====================================================
// READY EVENT
// =====================================================
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// =====================================================
// INTERACTION HANDLER (SAFE & PRODUCTION READY)
// =====================================================
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    // -------------------
    // /ping
    // -------------------
    if (interaction.commandName === "ping") {
      return interaction.reply("🏓 Pong!");
    }

    // -------------------
    // /website
    // -------------------
    if (interaction.commandName === "website") {
      await interaction.deferReply(); // prevents Discord timeout

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

    // -------------------
    // /announce
    // -------------------
    if (interaction.commandName === "announce") {
      await interaction.deferReply();

      const msg = interaction.options.getString("message");

      // check admin permission
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        return interaction.editReply("❌ You need Administrator permission to run this command.");
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
    console.log("⚠️ Interaction error:", err);

    if (interaction.deferred || interaction.replied) {
      return interaction.editReply("⚠️ Something went wrong while executing this command.");
    } else {
      return interaction.reply("⚠️ Something went wrong while executing this command.");
    }
  }
});

// =====================================================
// LOGIN
// =====================================================
client.login(process.env.TOKEN);
