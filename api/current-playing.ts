import querystring from "querystring";
import { VercelRequest, VercelResponse } from "@vercel/node";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

const TOKEN_URL = `https://accounts.spotify.com/api/token`;
const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

// get access token from spotify by using refreshToken
const getAccessToken = async () => {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: querystring.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  return response.json();
};

const NOW_PLAYING_URL = `https://api.spotify.com/v1/me/player/currently-playing`;

// get current playing song
const getNowPlaying = async () => {
  const { access_token } = await getAccessToken();

  return fetch(NOW_PLAYING_URL, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

// made a request when navigating to /api/current-playing
// and generate svg image with data
// then return it
export default async function (req: VercelRequest, res: VercelResponse) {
  const response = await getNowPlaying();

  if (response.status === 204 || response.status > 400) {
    return res.status(200).json({ isPlaying: false });
  }

  const song = await response.json();
  const isPlaying = song.is_playing;
  const title = song.item.name;
  const artist = song.item.artists.map((_artist) => _artist.name).join(", ");
  const album = song.item.album.name;
  const albumImageUrl = song.item.album.images[0].url;
  const songUrl = song.item.external_urls.spotify;
  const duration = song.item.duration_ms;
  const progress = song.progress_ms;

  // Calculate progress bar width dynamically
  const progressWidth = (progress / duration) * 250; // Progress relative to total width (250px)

  const svgContent = `
<svg width="400" height="100" viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="400" height="100" rx="10" fill="#181818"/>
    
    <!-- Album Art -->
    <image x="10" y="10" width="80" height="80" href="${albumImageUrl}" rx="5" />
    
    <!-- Song Title -->
    <text x="100" y="35" fill="white" font-size="16" font-family="Arial" font-weight="bold">
        ${title}
    </text>
    
    <!-- Artist Name -->
    <text x="100" y="55" fill="#B3B3B3" font-size="14" font-family="Arial">
        ${artist}
    </text>
    
    <!-- Progress Bar Background -->
    <rect x="100" y="75" width="250" height="5" rx="2.5" fill="#282828"/>
    
    <!-- Progress Bar Fill -->
    <rect x="100" y="75" width="${progressWidth}" height="5" rx="2.5" fill="#1DB954"/>
    
    <!-- Play/Pause Button -->
    <circle cx="370" cy="50" r="15" fill="#1DB954"/>
    ${
      isPlaying
        ? `<polygon points="365,42 365,58 377,50" fill="white"/>` // Play Icon
        : `<rect x="363" y="42" width="5" height="16" fill="white"/><rect x="372" y="42" width="5" height="16" fill="white"/>` // Pause Icon
    }
    </svg>`;

  // Set the response content type to "image/svg+xml"
  res.setHeader("Content-Type", "image/svg+xml");
  res.status(200).send(svgContent);
}
