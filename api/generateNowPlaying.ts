import { TNowPlayingProps } from "../types/types.js";

// collects all info about current song and returns it as an svg image of the player
export const generateNowPlaying = (props: TNowPlayingProps) => {
    const { coverImgTag, title, artist, progressWidth } = props;
    return `
        ${coverImgTag}
        <text x="100" y="35" fill="white" font-size="16" font-family="Arial" font-weight="bold">${title}</text>
        <text x="100" y="55" fill="#B3B3B3" font-size="14" font-family="Arial">${artist}</text>
        <rect x="100" y="75" width="250" height="5" rx="2.5" fill="#282828"/>
        <rect x="100" y="75" width="${progressWidth}" height="5" rx="2.5" fill="#1DB954"/>
        <circle cx="370" cy="50" r="15" fill="#1DB954"/>
        <polygon points="365,42 365,58 377,50" fill="white"/>`;
};
