const { Client, GatewayIntentBits } = require("discord.js");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const {
  token,
  twitchAccessToken,
  twitchClientId,
  channelId,
  streamerId,
  streamerName,
} = require("./config.json");

let isStreaming = false;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", () => {
  console.log("Bot is online!");
  checkStreamStatus();
  setInterval(checkStreamStatus, 15000); // Check every 15 seconds
});

async function checkStreamStatus() {
  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/streams?user_id=${streamerId}`,
      {
        headers: {
          "Client-ID": twitchClientId,
          Authorization: `Bearer ${twitchAccessToken}`,
        },
      }
    );
    const data = await response.json();

    if (data.data.length > 0) {
      if (!isStreaming) {
        isStreaming = true;
        let channel = client.channels.cache.get(channelId);
        if (channel) {
          channel.send(
            `@everyone 🔴 ${streamerName} is now live! Check out the stream at https://www.twitch.tv/${streamerName} !`
          );
        } else {
          console.error("Channel not found");
        }
      }
    } else {
      isStreaming = false;
    }
  } catch (error) {
    console.error("Error fetching stream status:", error);
  }
}

client.login(token);
