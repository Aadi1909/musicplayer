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
    const index = songs.findIndex((song) => song === selectedSong);
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
    let nextIndex = state.isShuffleOn
      ? Math.floor(Math.random() * songs.length)
      : (state.currentSongIndex + 1) % songs.length;
    await playSong(nextIndex);
  });

  prevButton.addEventListener("click", async () => {
    let prevIndex = state.isShuffleOn
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
};
