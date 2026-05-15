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
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} from "discord.js";

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

console.log("🚀 BOT STARTING...");

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
  new SlashCommandBuilder().setName("ping").setDescription("Check bot"),
  new SlashCommandBuilder().setName("website").setDescription("Show website"),
  new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Send an announcement")
    .addStringOption(opt =>
      opt.setName("message")
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
// INTERACTIONS HANDLER
// =====================================================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {

    // -------------------------
    // /ping
    // -------------------------
    if (interaction.commandName === "ping") {
      return interaction.reply("🏓 Pong!");
    }

    // -------------------------
    // /website
    // -------------------------
    if (interaction.commandName === "website") {
      const url = process.env.WEBSITE_URL || "https://example.com";

      const embed = new EmbedBuilder()
        .setTitle("🌐 My Website")
        .setDescription(`Click the button below to visit the website!`)
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

    // -------------------------
    // /announce
    // -------------------------
    if (interaction.commandName === "announce") {
      const msg = interaction.options.getString("message");

      // check admin permissions
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({
          content: "❌ You need Administrator permission.",
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("📢 Announcement")
        .setDescription(msg)
        .setColor("Green")
        .setFooter({ text: `Announcement by ${interaction.user.tag}` })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // fallback
    return interaction.reply({ content: "❓ Unknown command", ephemeral: true });

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
