import os

MUSIC_DIR = "public\Music"
SUPPORTED_EXTENSIONS = {".mp3", ".wav", ".flac", ".ogg", ".aac", ".m4a"}

def shorten_filenames(directory):
    if not os.path.exists(directory):
        print(f"Directory '{directory}' does not exist.")
        return

    files = os.listdir(directory)
    audio_files = [f for f in files if os.path.splitext(f)[1].lower() in SUPPORTED_EXTENSIONS]

    for index, filename in enumerate(audio_files, start=1):
        _, ext = os.path.splitext(filename)
        new_name = f"song_{index}{ext}"
        old_path = os.path.join(directory, filename)
        new_path = os.path.join(directory, new_name)

        # Avoid overwriting files accidentally
        if old_path != new_path:
            print(f"Renaming: {filename} -> {new_name}")
            os.rename(old_path, new_path)

if __name__ == "__main__":
    shorten_filenames(MUSIC_DIR)
