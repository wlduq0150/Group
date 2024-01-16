export default () => ({
    discord: {
        clientId: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        redirectUri: process.env.DISCORD_REDIRECT_URI,
        scope: process.env.DISCORD_SCOPE,
        guildId: process.env.DISCORD_GUILD_ID,
        botToken: process.env.DISCORD_BOT_TOKEN,
    },
});
