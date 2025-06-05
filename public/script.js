import { getElements, addEventListeners, musicImages } from "./utils/utils.js";
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/songs");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    let songs;
    try {
      songs = await response.json();
    } catch (err) {
      console.error("JSON parse failed:", err);
      throw err;
    }
    if (songs.length === 0) {
      // !Array.isArray(songs) is not needed here as we already checked if songs is an array
      alert("No songs found in the audio directory");
      return;
    }

    const likedSongMapping = new Map();
    const audioContext = new AudioContext();
    const {
      audioElement,
      dropDown,
      playButton,
      pauseButton,
      albumArt,
      favIcon,
    } = getElements(document);
    const track = audioContext.createMediaElementSource(audioElement);
    track.connect(audioContext.destination);

    let state = {
      currentSongIndex: -1,
      isShuffleOn: 0,
      repeatOn: 0,
    };

    audioElement.volume = 1;
    audioElement.muted = false;

    songs.forEach((song) => {
      likedSongMapping.set(song, false);
    });
    const elements = getElements(document);
    // console.log("Elements:", elements); check this line to see if elements are correctly fetched
    addEventListeners(
      elements,
      state,
      playSong,
      songs,
      audioContext,
      likedSongMapping,
      toogleLikedSong,
      updateFavIcon
    );

    // console.log(likedSongMapping)
    songs.forEach((song) => {
      const option = document.createElement("option");
      option.value = song;
      option.textContent = song;
      dropDown.appendChild(option);
    });

    // async function fetchPicsumImages() {
    //   try {
    //     const res = await fetch("https://picsum.photos/v2/list?page=1&limit=10");
    //     if (!res.ok) throw new Error("Failed to fetch images");
    //     const images = await res.json();
    //     return images; // array of image metadata objects
    //   } catch (err) {
    //     console.error(err);
    //     return [];
    //   }
    // }

    let randomImageUrl =
      musicImages[Math.floor(Math.random() * musicImages.length)];
    albumArt.src = randomImageUrl;

    function handleFileUpload() {
      // files the user have dropped
    }

    async function playSong(index) {
      if (index < 0 || index >= songs.length) return;
      state.currentSongIndex = index;
      const selectedSong = songs[index];
      const encodedSong = encodeURIComponent(selectedSong);
      audioElement.src = `http://localhost:3000/Music/${encodedSong}`;

      randomImageUrl =
        musicImages[Math.floor(Math.random() * musicImages.length)];
      albumArt.src = randomImageUrl;

      updateFavIcon(selectedSong, favIcon)
      await audioElement.play();

      playButton.classList.add("hidden");
      pauseButton.classList.remove("hidden");
      dropDown.value = selectedSong;
    }

    function updateFavIcon(song, icon) {
      if (likedSongMapping.get(song)) {
        icon.textContent = "favorite";
        icon.classList.remove("text-gray-500");
        icon.classList.add("text-red-500");
      } else {
        icon.textContent = "favorite_border";
        icon.classList.remove("text-red-500");
        icon.classList.add("text-gray-500");
      }
    }

    function toogleLikedSong(currentSongIndex) {
      const songToToggleValue = likedSongMapping.get(songs[currentSongIndex]);
      if (songToToggleValue !== undefined) {
        likedSongMapping.set(songs[state.currentSongIndex], !songToToggleValue);
      }
    }

    // Features
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    alert(
      "An error occurred while loading songs. Check the console for details."
    );
  }
});
