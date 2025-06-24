export const getElements = (document) => {
  return {
    audioElement: document.getElementById("audio-player"),
    dropDown: document.getElementById("songSelect"),
    playButton: document.getElementById("play-button"),
    pauseButton: document.getElementById("pause-button"),
    nextButton: document.getElementById("next-button"),
    prevButton: document.getElementById("prev-button"),
    progressBar: document.getElementById("progress-bar"),
    albumArt: document.getElementById("album-art"),
    favIcon: document.getElementById("fav-icon"),
    shuffleButton: document.getElementById("shuffle-btn"),
    repeatButton: document.getElementById("repeat"),
    currentTimeEl: document.getElementById("current-time"),
    totalTimeEl: document.getElementById("total-time"),
    uploadButton: document.getElementById("upload-button"),
    fileUpload: document.getElementById("file-upload"),
    playlistPage: document.getElementById("playlist-page"),
    backIcon: document.getElementById("back-icon"),
    musicPage: document.getElementById("music-page"),
    songList: document.getElementById("song-lists"),
    songContainer: document.getElementById("songs-container"),
    themeToggle: document.getElementById("theme-toggle"),
    visualizer: document.getElementById("visualizer"),
    playlist: document.getElementById("playlist"),
    backToPlayer: document.getElementById("back-to-player"),
  };
};


export const addEventListeners = (
  elements,
  state,
  playSong,
  songs,
  audioContext,
  likedSongMapping,
  toggleLikedSong,
  updateFavIcon,
  formatTime
) => {
  const {
    audioElement,
    dropDown,
    playButton,
    pauseButton,
    nextButton,
    prevButton,
    progressBar,
    favIcon,
    shuffleButton,
    repeatButton,
    currentTimeEl,
    totalTimeEl,
    uploadButton,
    fileUpload,
    playlistPage,
    backIcon,
    musicPage,
    songList,
    songContainer,
    backToPlayer,
  } = elements;

  audioElement.addEventListener("loadedmetadata", () => {
    progressBar.max = 100;
    progressBar.disabled = false;
    totalTimeEl.textContent = formatTime(audioElement.duration);
  });

  audioElement.addEventListener("timeupdate", () => {
    if (!isNaN(audioElement.duration)) {
      const progress = (audioElement.currentTime / audioElement.duration) * 100;
      progressBar.value = progress;
      currentTimeEl.textContent = formatTime(audioElement.currentTime);
    }
  });

  progressBar.addEventListener("input", () => {
    if (!isNaN(audioElement.duration)) {
      const newTime = (progressBar.value / 100) * audioElement.duration;
      audioElement.currentTime = newTime;
    }
  });

  dropDown.addEventListener("change", async (e) => {
    const selectedSong = e.target.value;
    const index = songs.findIndex((song) => song.url === selectedSong || song === selectedSong);
    if (index !== -1) {
      if (audioContext.state === "suspended") await audioContext.resume();
      await playSong(index);
    }
  });

  playButton.addEventListener("click", async () => {
    if (audioContext.state === "suspended") await audioContext.resume();
    await audioElement.play();
    playButton.classList.add("hidden");
    pauseButton.classList.remove("hidden");
  });

  pauseButton.addEventListener("click", () => {
    audioElement.pause();
    pauseButton.classList.add("hidden");
    playButton.classList.remove("hidden");
  });

  nextButton.addEventListener("click", async () => {
    const nextIndex = state.isShuffleOn
      ? Math.floor(Math.random() * songs.length)
      : (state.currentSongIndex + 1) % songs.length;
    await playSong(nextIndex);
  });

  prevButton.addEventListener("click", async () => {
    const prevIndex = state.isShuffleOn
      ? Math.floor(Math.random() * songs.length)
      : (state.currentSongIndex - 1 + songs.length) % songs.length;
    await playSong(prevIndex);
  });

  favIcon.addEventListener("click", () => {
    const index = state.currentSongIndex;
    if (index !== -1) {
      toggleLikedSong(index);
      updateFavIcon(songs[index], favIcon);
    }
  });

  shuffleButton.addEventListener("click", () => {
    state.isShuffleOn = !state.isShuffleOn;
    shuffleButton.classList.toggle("text-blue-700", state.isShuffleOn);
    shuffleButton.classList.toggle("text-gray-400", !state.isShuffleOn);
  });

  repeatButton.addEventListener("click", () => {
    if (state.repeatOn === 0) {
      state.repeatOn = 1;
      state.repeatOnce = true;
      repeatButton.textContent = "repeat_one";
      repeatButton.classList.add("text-green-500");
      repeatButton.classList.remove("text-yellow-400");
    } else if (state.repeatOn === 1) {
      state.repeatOn = 2;
      state.repeatOnce = false;
      repeatButton.textContent = "loop";
      repeatButton.classList.remove("text-green-500");
      repeatButton.classList.add("text-yellow-400");
    } else {
      state.repeatOn = 0;
      state.repeatOnce = false;
      repeatButton.textContent = "repeat";
      repeatButton.classList.remove("text-green-500", "text-yellow-400");
    }
  });

  audioElement.addEventListener("ended", () => {
    if (state.repeatOn === 1 && state.repeatOnce) {
      state.repeatOnce = false;
      playSong(state.currentSongIndex);
    } else if (state.repeatOn === 2) {
      playSong(state.currentSongIndex);
    } else {
      const nextIndex = state.isShuffleOn
        ? Math.floor(Math.random() * songs.length)
        : (state.currentSongIndex + 1) % songs.length;
      playSong(nextIndex);
    }
  });

  backIcon.addEventListener("click", function () {
    playlistPage.classList.remove("hidden");
    musicPage.classList.add("hidden");

    songContainer.innerHTML = ""; // Prevent duplicate list
    songs.forEach((song) => {
      const li = document.createElement("li");
      li.className = `
        flex items-center gap-3 p-3 
        bg-white text-gray-800 
        rounded-xl shadow-sm 
        hover:bg-gray-100 
        transition cursor-pointer
        w-full
      `;
      li.innerHTML = `
        <span class="text-purple-500 text-lg">🎵</span>
        <span class="text-sm font-semibold truncate">${song.name}</span>
      `;
      songContainer.appendChild(li);
    });
  });

  backToPlayer.addEventListener("click", function() {
    playlistPage.classList.add("hidden");
    musicPage.classList.remove("hidden");
  });

  uploadButton.addEventListener("click", function () {
    fileUpload.click();
  });

  fileUpload.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("audio", file);

    fetch("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.success) {
          alert("Upload Successful");
        } else {
          alert("Upload failed!");
        }
      })
      .catch((err) => {
        console.error("Upload error:", err);
      });
  });
};
