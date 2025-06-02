# Simple Music Player

A simple web-based music player built with Node.js, Express, and Tailwind CSS. This app allows you to play MP3 files from the `public/Music` directory on your local machine via a modern, responsive UI.

## Features
- Browse and play MP3 files from the `public/Music` folder
- Play, pause, next, and previous controls
- Progress slider for seeking
- Responsive and modern UI with Tailwind CSS

## Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher recommended)

## Getting Started

### 1. Clone or Download the Repository
```
git clone https://github.com/Aadi1909/musicplayer.git
cd musicplayer
```
Or simply download and extract the ZIP, then open the folder in your terminal.

### 2. Install Dependencies
```
npm install
```

### 3. Add Your Music Files
Place your `.mp3` files inside the `public/Music` directory. The app will automatically list all MP3s in this folder.

### 4. Start the Server
```
npm start
```
Or, if there is no `start` script in `package.json`, run:
```
node server.js
```

### 5. Open the App
Go to [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure
```
public/
  index.html        # Main frontend UI
  script.js         # Frontend logic (fetches songs, controls   player)
  Music/            # Place your MP3 files here
server.js           # Express server (serves frontend and API)
package.json        # Project metadata and dependencies
```

## How It Works
- The Express server serves static files from `public/` and exposes an API endpoint `/api/songs` to list available MP3 files.
- The frontend fetches the song list and allows you to play them using the built-in HTML5 `<audio>` element.

## Notes
- Only `.mp3` files in the `public/Music` directory will be listed.
- CORS is enabled for audio streaming.
- Tested on modern browsers (Chrome, Edge, Firefox).

## License
This project is for educational and personal use.
