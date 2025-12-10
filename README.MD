# spotify-current-playing

This serverless API endpoint generates an SVG card with the **currently playing** track on _my_ Spotify account, including song title, artist, album art, and playback progress.

## Project Structure

Main code in the `/api` folder.
`/api/current-playing.ts` - main file and logic
`/api/spotify.ts` - spotify authorization and request to the api
`/api/generateNowPlaying.ts` - function helper which collects variables from the request, and returns svg string.
