export const getElements = (document) => {
  return {
    audioElement: document.getElementById("audio-player"),
    dropDown: document.getElementById("songSelect"),
    playButton: document.getElementById("play-button"),
    pauseButton: document.getElementById("pause-button"),
    nextButton: document.getElementById("next-button"),
    prevButton: document.getElementById("prev-button"),
    slider: document.getElementById("progress"),
    albumArt: document.getElementById("album-art"),
    favIcon: document.getElementById("fav-icon"),
    shuffleButton: document.getElementById("shuffle-btn"),
    repeatButton: document.getElementById("repeat"),
  };
};

export const addEventListeners = (
  elements,
  state,
  playSong,
  songs,
  audioContext,
  likedSongMapping,
  toogleLikedSong,
  updateFavIcon
) => {
  const {
    audioElement,
    dropDown,
    playButton,
    pauseButton,
    nextButton,
    prevButton,
    slider,
    favIcon,
    shuffleButton,
    repeatButton,
  } = elements;
  audioElement.addEventListener("loadedmetadata", () => {
    slider.max = Math.floor(audioElement.duration);
  });
  let selectedSong;
  audioElement.addEventListener("timeupdate", () => {
    slider.value = Math.floor(audioElement.currentTime);
  });

  audioElement.addEventListener("ended", () => {
    if (state.repeatOn > 0) {
      state.repeatOn--;
      if (repeatButton.textContent === "repeat_one_on") {
        repeatButton.textContent = "repeat";
        repeatButton.classList.remove("text-green-500");
      }
      playSong(state.currentSongIndex);
    } else {
      state.currentSongIndex = (state.currentSongIndex + 1) % songs.length;
      playSong(state.currentSongIndex);
    }
  });

  dropDown.addEventListener("change", async (event) => {
    selectedSong = event.target.value;
    const index = songs.findIndex((song) => song === selectedSong);
    if (index !== -1) {
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
      await playSong(index);
    }
  });

  playButton.addEventListener("click", async () => {
    if (audioContext.state === "suspended" || selectedSong) {
      await audioContext.resume();
    }
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
    let nextIndex;
    if (state.isShuffleOn) {
      nextIndex = Math.floor(Math.random() * songs.length);
    } else {
      nextIndex = (state.currentSongIndex + 1) % songs.length;
    }
    await playSong(nextIndex);
  });

  prevButton.addEventListener("click", async () => {
    let prevIndex;
    if (state.isShuffleOn) {
      prevIndex = Math.floor(Math.random() * songs.length);
    } else {
      prevIndex = (state.currentSongIndex - 1 + songs.length) % songs.length;
    }
    await playSong(prevIndex);
  });

  slider.addEventListener("input", () => {
    audioElement.currentTime = slider.value;
  });
  favIcon.addEventListener("click", () => {
    if (state.currentSongIndex !== -1) {
      const selectedSong = songs[state.currentSongIndex];
      toogleLikedSong(state.currentSongIndex);
      updateFavIcon(selectedSong, favIcon);
    }
  });

  shuffleButton.addEventListener("click", () => {
    state.isShuffleOn = !state.isShuffleOn;
    if (state.isShuffleOn) {
      shuffleButton.classList.remove("text-gray-400");
      shuffleButton.classList.add("text-blue-700");
    } else {
      shuffleButton.classList.remove("text-blue-700");
      shuffleButton.classList.add("text-gray-400");
    }
  });

  repeatButton.addEventListener("click", () => {
    if (!state.repeatOn) {
      state.repeatOn = 1;
      repeatButton.textContent = "repeat_one_on";
      repeatButton.classList.add("text-green-500");
    } else {
      state.repeatOn = 0;
      repeatButton.textContent = "repeat";
      repeatButton.classList.remove("text-green-500");
    }
  });
};

export const musicImages = [
  "https://cdn.pixabay.com/photo/2017/09/28/14/58/piano-2795807_1280.jpg",
  "https://cdn.pixabay.com/photo/2016/11/29/03/42/mic-1867121_1280.jpg",
  "https://cdn.pixabay.com/photo/2023/04/01/01/28/piano-7891138_1280.jpg",
  "https://cdn.pixabay.com/photo/2015/06/08/08/30/instruments-801271_1280.jpg",
  "https://cdn.pixabay.com/photo/2024/09/17/23/23/studio-9054709_1280.jpg",
  "https://cdn.pixabay.com/photo/2024/02/07/18/42/music-8559592_1280.jpg",
  "https://cdn.pixabay.com/photo/2023/10/24/21/15/nature-8339115_1280.jpg",
  "https://cdn.pixabay.com/photo/2015/04/29/09/33/drums-745077_1280.jpg",
  "https://cdn.pixabay.com/photo/2016/11/29/12/39/recording-studio-1869560_1280.jpg",
  "https://cdn.pixabay.com/photo/2023/12/22/16/29/sheet-music-8463988_1280.jpg",
  "https://cdn.pixabay.com/photo/2018/09/26/01/06/piano-3703616_1280.jpg",
  "https://cdn.pixabay.com/photo/2021/09/29/22/59/viola-6668608_1280.jpg",
  "https://cdn.pixabay.com/photo/2015/05/27/09/02/music-786136_1280.jpg",
];
