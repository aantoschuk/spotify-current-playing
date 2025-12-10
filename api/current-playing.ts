import { VercelRequest, VercelResponse } from "@vercel/node";

import { getNowPlaying } from "./spotify.js";
import { generateNowPlaying } from "./generateNowPlaying.js";

import { CONSTANTS } from "../config/constants.js";
import { TArtist, TItem } from "../types/types.js";

// Handles requests to /api/current-playing,
// generates an SVG image from the data, and returns it
export default async function handler(_: VercelRequest, res: VercelResponse) {
    const response = await getNowPlaying();
    let innerContent = "";

    if (response.status === 204) {
        innerContent = CONSTANTS.svg.nothingPlayed;
    } else if (!response.ok) {
        innerContent = CONSTANTS.svg.spotifyError;
    } else {
        const song = await response.json();
        const isPlaying = song.is_playing;
        const isAd = song.currently_playing_type === "ad" || !song.item;

        if (!isPlaying || isAd) {
            innerContent = CONSTANTS.svg.ad;
        } else {
            const title = song.item.name;
            const artist = song.item.artists
                .map((a: TArtist) => a.name)
                .join(", ");
            const item: TItem = song.item;
            const albumImageUrl = item.album.images[0]?.url;
            const progressWidth =
                (song.progress_ms / song.item.duration_ms) * 250;

            let coverImgTag = "";
            if (albumImageUrl) {
                const buff = await (await fetch(albumImageUrl)).arrayBuffer();
                coverImgTag = `<image x="10" y="10" width="80" height="80" href="data:image/jpeg;base64,${Buffer.from(buff).toString("base64")}" rx="5"/>`;
            }

            innerContent = generateNowPlaying({
                coverImgTag,
                title,
                artist,
                progressWidth,
            });
        }
    }

    const svgContent = `
    <svg width="400" height="100" viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="100" rx="10" fill="#181818"/>
      ${innerContent}
    </svg>`;

    res.setHeader("Content-Type", "image/svg+xml");
    res.status(200).send(svgContent);
}
