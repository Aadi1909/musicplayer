import { getElements, addEventListeners } from "./utils/utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(`http://127.0.0.1:3000/api/songs`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const songs = await response.json();


    const API_KEY = "your-api-key";
    const IMAGE_API = `https://pixabay.com/api/?key=${API_KEY}&q=music&per_page=200`;

    let musicImages = [];
    const usedImageIndexes = new Set();

    async function loadImages() {
      const res = await fetch(IMAGE_API);
      const json = await res.json();
      musicImages = json.hits.map((hit) => hit.webformatURL);
      usedImageIndexes.clear();
    }

    await loadImages();

    const getRandomImageUrl = async () => {
      if (usedImageIndexes.size >= musicImages.length) {
        await loadImages();
      }
      let index;
      do {
        index = Math.floor(Math.random() * musicImages.length);
      } while (usedImageIndexes.has(index));
      usedImageIndexes.add(index);
      return musicImages[index];
    };

    const elements = getElements(document);
    const {
      audioElement,
      dropDown,
      albumArt,
      favIcon,
      playButton,
      pauseButton,
      uploadButton,
      fileUpload,
    } = elements;

    const likedSongMapping = new Map();
    const audioContext = new AudioContext();
    const track = audioContext.createMediaElementSource(audioElement);
    track.connect(audioContext.destination);

    let state = {
      currentSongIndex: -1,
      isShuffleOn: 0,
      repeatOn: 0,
      repeatOnce: false,
    };
    songs.forEach((song) => likedSongMapping.set(song, false));
    songs.forEach((song) => {
      const option = document.createElement("option");
      option.value = song.url;
      option.textContent = song.name;
      dropDown.appendChild(option);
    });

    albumArt.src = await getRandomImageUrl();

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const updateFavIcon = (song, icon) => {
      const liked = likedSongMapping.get(song);
      icon.textContent = liked ? "favorite" : "favorite_border";
      icon.classList.toggle("text-red-500", liked);
      icon.classList.toggle("text-gray-500", !liked);
    };

    const toggleLikedSong = (index) => {
      const song = songs[index];
      likedSongMapping.set(song, !likedSongMapping.get(song));
    };

    async function playSong(index) {
      if (index < 0 || index >= songs.length) return;
      state.currentSongIndex = index;
      const selectedSong = songs[index];
      console.log(selectedSong);
      audioElement.src = selectedSong.url;
      albumArt.src = await getRandomImageUrl();
      updateFavIcon(selectedSong, favIcon);
      await audioElement.play();
      playButton.classList.add("hidden");
      pauseButton.classList.remove("hidden");
      dropDown.value = selectedSong.url;
    }

    addEventListeners(
      elements,
      state,
      playSong,
      songs,
      audioContext,
      likedSongMapping,
      toggleLikedSong,
      updateFavIcon,
      formatTime,
      uploadButton,
      fileUpload
    );
  } catch (err) {
    console.error("Load Error:", err);
    alert("Failed to load songs.");
  }
});
