module.exports = {
    environment: "DE",
    clientId: '1313170068997275648',
    redirectUri: 'http://localhost:7847/callback',
    scope: 'identify email',
    authUrl: `https://discord.com/api/oauth2/authorize?client_id=1313170068997275648&redirect_uri=${encodeURIComponent("http://localhost:7847/callback")}&response_type=code&scope=${encodeURIComponent("identify email")}`,

}