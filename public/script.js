document.addEventListener("DOMContentLoaded", async () => {
  const musicImages = [
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
    "https://cdn.pixabay.com/photo/2015/05/27/09/02/music-786136_1280.jpg"
  ];

  try {
    const response = await fetch("http://127.0.0.1:3000/api/songs");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    let songs = await response.json();

    if (!Array.isArray(songs) || songs.length === 0) {
      alert("No songs found in the audio directory");
      return;
    }

    const albumArt = document.getElementById("album-art");
    const dropDown = document.querySelector(".songs-list");
    const audioElement = document.querySelector("audio");
    const playButton = document.querySelector(".play-button");
    const pauseButton = document.querySelector(".pause-button");
    const nextButton = document.querySelector(".next-button");
    const prevButton = document.querySelector(".prev-button");
    const slider = document.querySelector(".music-slider");

    const audioContext = new AudioContext();
    const track = audioContext.createMediaElementSource(audioElement);
    track.connect(audioContext.destination);

    audioElement.volume = 1;
    audioElement.muted = false;

    // Populate dropdown with songs
    songs.forEach((song) => {
      const option = document.createElement("option");
      option.value = song;
      option.textContent = song;
      dropDown.appendChild(option);
    });

    let currentSongIndex = -1;

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

    let randomImageUrl = musicImages[Math.floor(Math.random() * musicImages.length)];
    albumArt.src = randomImageUrl;

    async function playSong(index) {
      if (index < 0 || index >= songs.length) return;
      currentSongIndex = index;
      const selectedSong = songs[index];
      const encodedSong = encodeURIComponent(selectedSong);
      audioElement.src = `http://localhost:3000/Music/${encodedSong}`;

      randomImageUrl = musicImages[Math.floor(Math.random() * musicImages.length)];
      albumArt.src = randomImageUrl;

      await audioElement.play();
      playButton.classList.add("hidden");
      pauseButton.classList.remove("hidden");
      dropDown.value = selectedSong;
    }

    dropDown.addEventListener("change", async (event) => {
      const selectedSong = event.target.value;
      const index = songs.findIndex((song) => song === selectedSong);
      if (index !== -1) {
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }
        await playSong(index);
      }
    });

    playButton.addEventListener("click", async () => {
      if (audioContext.state === "suspended") {
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
      const nextIndex = (currentSongIndex + 1) % songs.length;
      await playSong(nextIndex);
    });

    prevButton.addEventListener("click", async () => {
      const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
      await playSong(prevIndex);
    });

    audioElement.addEventListener("loadedmetadata", () => {
      slider.max = Math.floor(audioElement.duration);
    });

    audioElement.addEventListener("timeupdate", () => {
      slider.value = Math.floor(audioElement.currentTime);
    });

    slider.addEventListener("input", () => {
      audioElement.currentTime = slider.value;
    });
  } catch (error) {
    console.error("Failed to fetch songs:", error);
    alert(
      "An error occurred while loading songs. Check the console for details."
    );
  }
});
