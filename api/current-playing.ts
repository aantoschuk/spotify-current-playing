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

  let svgContent = "";
  if (response.status === 204) {
    console.log("Nothing is currently playing (204)");
    // handle like paused or no content
    svgContent = `
  <svg width="400" height="100" viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="100" rx="10" fill="#181818"/>
    <text x="50%" y="50%" fill="#B3B3B3" font-size="18" font-family="Arial" text-anchor="middle" alignment-baseline="middle">
      Nothing is currently playing 
    </text>
  </svg>`;
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svgContent);
  }

  if (!response.ok) {
    console.error("Spotify error:", response.status, await response.text());
    // handle error (maybe expired token or no active device)
    svgContent = `
  <svg width="400" height="100" viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="100" rx="10" fill="#181818"/>
    <text x="50%" y="50%" fill="#B3B3B3" font-size="18" font-family="Arial" text-anchor="middle" alignment-baseline="middle">
       Spotify Error
    </text>
  </svg>`;
    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svgContent);
  }

  const song = await response.json();
  console.log(song);
  const isPlaying = song.is_playing;
  // check if it's an ad, cause ad breaks image generation
  const isAd = song.currently_playing_type === "ad" || !song.item;

  if (!isPlaying || isAd) {
    svgContent = `
  <svg width="400" height="100" viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="100" rx="10" fill="#181818"/>
    <text x="50%" y="50%" fill="#B3B3B3" font-size="18" font-family="Arial" text-anchor="middle" alignment-baseline="middle">
      ${!isPlaying ? "Not Active" : "Advertisement Playing"}
    </text>
  </svg>`;
  } else {
    const title = song.item.name;
    const artist = song.item.artists.map((_artist) => _artist.name).join(", ");
    const albumImageUrl = song.item.album.images[0].url;
    const duration = song.item.duration_ms;
    const progress = song.progress_ms;

    const progressWidth = (progress / duration) * 250;

    let coverImg = null;
    if (albumImageUrl) {
      const buff = await (await fetch(albumImageUrl)).arrayBuffer();
      coverImg = `data:image/jpeg;base64,${Buffer.from(buff).toString("base64")}`;
    }

    svgContent = `
  <svg width="400" height="100" viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="100" rx="10" fill="#181818"/>
      <image x="10" y="10" width="80" height="80" href="${coverImg}" rx="5" />
      <text x="100" y="35" fill="white" font-size="16" font-family="Arial" font-weight="bold">
          ${title}
      </text>
      <text x="100" y="55" fill="#B3B3B3" font-size="14" font-family="Arial">
          ${artist}
      </text>
      <rect x="100" y="75" width="250" height="5" rx="2.5" fill="#282828"/>
      <rect x="100" y="75" width="${progressWidth}" height="5" rx="2.5" fill="#1DB954"/>
      <circle cx="370" cy="50" r="15" fill="#1DB954"/>
      <polygon points="365,42 365,58 377,50" fill="white"/>
  </svg>`;
  }

  // Set the response content type to "image/svg+xml"
  res.setHeader("Content-Type", "image/svg+xml");
  res.status(200).send(svgContent);
}
