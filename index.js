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

app.get("/", (req, res) => res.send("✅ Bot is running"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🌐 Web server running"));

// =====================================================
// DISCORD CLIENT
// =====================================================
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// =====================================================
// SLASH COMMANDS
// =====================================================
const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Ping the bot"),
  new SlashCommandBuilder().setName("website").setDescription("Show website"),
  new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Send announcement")
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
client.once("ready", () => console.log(`✅ Logged in as ${client.user.tag}`));

// =====================================================
// INTERACTION HANDLER (WORKING + SAFE)
// =====================================================
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    // /ping — fast, no defer needed
    if (interaction.commandName === "ping") {
      return interaction.reply("🏓 Pong!");
    }

    // /website — fast, embed only
    if (interaction.commandName === "website") {
      const url = process.env.WEBSITE_URL || "No website set";

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🌐 Website")
            .setDescription(url)
            .setColor("#5865F2")
        ]
      });
    }

    // /announce — fast, embed only, admin-only
    if (interaction.commandName === "announce") {
      const msg = interaction.options.getString("message");

      if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: "❌ You need Administrator permission.", ephemeral: true });
      }

      return interaction.reply({
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

    if (!interaction.replied && !interaction.deferred) {
      return interaction.reply({ content: "⚠️ Something went wrong.", ephemeral: true });
    }
  }
});

// =====================================================
// LOGIN
// =====================================================
client.login(process.env.TOKEN);
