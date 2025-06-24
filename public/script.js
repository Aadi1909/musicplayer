import { getElements, addEventListeners } from "./utils/utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Initial theme setting
    const isDarkMode = localStorage.getItem("darkMode") !== "false";
    document.body.classList.toggle("bg-gray-100", !isDarkMode);
    document.body.classList.toggle("bg-gray-900", isDarkMode);
    document
      .querySelector(".bg-gray-800")
      ?.classList.toggle("bg-gray-200", !isDarkMode);
    document
      .querySelector(".bg-gray-800")
      ?.classList.toggle("bg-gray-800", isDarkMode);
    document
      .querySelector(".text-white")
      ?.classList.toggle("text-black", !isDarkMode);
    document
      .querySelector(".text-white")
      ?.classList.toggle("text-white", isDarkMode);

    const response = await fetch("http://127.0.0.1:3000/api/songs");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const songs = await response.json();

    if (songs.length === 0) {
      alert("No songs found.");
      return;
    }

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
      playlistPage,
      backIcon,
      musicPage,
      songList,
      songContainer,
      themeToggle,
      backToPlayer,
    } = elements;

    const likedSongMapping = new Map();
    const audioContext = new AudioContext();
    const track = audioContext.createMediaElementSource(audioElement);

    // Visualizer setup
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    track.connect(analyzer);
    analyzer.connect(audioContext.destination);

    const canvas = document.getElementById("visualizer");
    const canvasCtx = canvas.getContext("2d");

    function drawVisualizer() {
      requestAnimationFrame(drawVisualizer);
      analyzer.getByteFrequencyData(dataArray);
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        const isDark = localStorage.getItem("darkMode") !== "false";
        const gradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, isDark ? "#8b5cf6" : "#4f46e5");
        gradient.addColorStop(1, isDark ? "#ec4899" : "#db2777");
        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    }

    canvas.width = canvas.clientWidth * 2;
    canvas.height = canvas.clientHeight * 2;
    drawVisualizer();

    let state = {
      currentSongIndex: -1,
      isShuffleOn: false,
      repeatOn: 0,
      repeatOnce: false,
    };

    songs.forEach((song) => likedSongMapping.set(song.url, false));
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
      const liked = likedSongMapping.get(song.url);
      icon.textContent = liked ? "favorite" : "favorite_border";
      icon.classList.toggle("text-red-500", liked);
      icon.classList.toggle("text-gray-500", !liked);
    };

    const toggleLikedSong = (index) => {
      const song = songs[index];
      likedSongMapping.set(song.url, !likedSongMapping.get(song.url));
    };

    // Create playlist UI
    const playlistEl = document.getElementById("playlist");

    function renderPlaylist() {
      playlistEl.innerHTML = "";
      songs.forEach((song, idx) => {
        const item = document.createElement("div");
        item.className = `playlist-item flex justify-between items-center p-2 ${
          state.currentSongIndex === idx
            ? "bg-purple-900 bg-opacity-30 playing"
            : ""
        }`;
        item.innerHTML = `
      <div class="flex items-center">
        <span class="material-icons mr-2 text-sm ${
          state.currentSongIndex === idx ? "text-purple-400" : "text-gray-400"
        }">
          ${state.currentSongIndex === idx ? "play_arrow" : "music_note"}
        </span>
        <span class="truncate cursor-pointer">${song.name}</span>
      </div>
      <span class="material-icons text-sm cursor-pointer text-gray-400 hover:text-red-500">
        ${likedSongMapping.get(song) ? "favorite" : "favorite_border"}
      </span>
    `;

        item.addEventListener("click", () => playSong(idx));
        item
          .querySelector(".material-icons:last-child")
          .addEventListener("click", (e) => {
            e.stopPropagation();
            toggleLikedSong(idx);
            renderPlaylist();
          });

        playlistEl.appendChild(item);
      });
    }

    renderPlaylist();

    async function playSong(index) {
      if (index < 0 || index >= songs.length) return;
      state.currentSongIndex = index;
      const selectedSong = songs[index];
      audioElement.src = selectedSong.url;
      albumArt.src = await getRandomImageUrl();
      updateFavIcon(selectedSong, favIcon);
      await audioElement.play();
      playButton.classList.add("hidden");
      pauseButton.classList.remove("hidden");
      dropDown.value = selectedSong.url;
    }

    themeToggle.addEventListener("click", () => {
      const isDark = localStorage.getItem("darkMode") !== "false";
      localStorage.setItem("darkMode", isDark ? "false" : "true");
      document.body.classList.toggle("bg-gray-100");
      document.body.classList.toggle("bg-gray-900");
      document
        .querySelector(".bg-gray-200, .bg-gray-800")
        ?.classList.toggle("bg-gray-200");
      document
        .querySelector(".bg-gray-200, .bg-gray-800")
        ?.classList.toggle("bg-gray-800");
      document
        .querySelector(".text-black, .text-white")
        ?.classList.toggle("text-black");
      document
        .querySelector(".text-black, .text-white")
        ?.classList.toggle("text-white");
      themeToggle.textContent = isDark ? "light_mode" : "dark_mode";
    });

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
      fileUpload,
      playlistPage,
      backIcon,
      musicPage,
      songList,
      songContainer,
      backToPlayer,
    );
  } catch (err) {
    console.error("Load Error:", err);
    alert(`Failed to load songs: ${err.message}`);
  }
});
