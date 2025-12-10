import { CONFIG } from "./config.js";

const { clientId, clientSecret } = CONFIG;

// static, global variables 
export const CONSTANTS = {
    nowPlaying: `https://api.spotify.com/v1/me/player/currently-playing`,
    basicAuth: Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    tokenUrl: `https://accounts.spotify.com/api/token`,
    svg: {
        nothingPlayed: `
      <text x="50%" y="50%" fill="#B3B3B3" font-size="18" font-family="Arial" text-anchor="middle" alignment-baseline="middle">
        Nothing is currently playing
      </text>`,
        spotifyError: `
      <text x="50%" y="50%" fill="#B3B3B3" font-size="18" font-family="Arial" text-anchor="middle" alignment-baseline="middle">
        Nothing is currently playing
      </text>`,
        ad: `
      <text x="50%" y="50%" fill="#B3B3B3" font-size="18" font-family="Arial" text-anchor="middle" alignment-baseline="middle">
        Nothing is currently playing
      </text>`,
    },
} as const;

