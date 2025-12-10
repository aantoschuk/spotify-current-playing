import querystring from "querystring";

import { CONFIG } from "../config/config.js";
import { CONSTANTS } from "../config/constants.js";

// get access token from spotify by using refreshToken
export const getAccessToken = async () => {
    const response = await fetch(CONSTANTS.tokenUrl, {
        method: "POST",
        headers: {
            Authorization: `Basic ${CONSTANTS.basicAuth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: querystring.stringify({
            grant_type: "refresh_token",
            refresh_token: CONFIG.refreshToken,
        }),
    });

    return response.json();
};


// get current playing song
export const getNowPlaying = async () => {
    const { access_token } = await getAccessToken();

    return fetch(CONSTANTS.nowPlaying, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });
};
