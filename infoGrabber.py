import os
import json
from mutagen.mp3 import MP3

# Define the folder path
folder_path = "./sounds"

# Define the array to store the objects
sound_objects = []

# Loop through each folder in the main folder
for folder_name in os.listdir(folder_path):
    folder_pathname = os.path.join(folder_path, folder_name)

    # Only process directories
    if os.path.isdir(folder_pathname):
        for file_name in os.listdir(folder_pathname):
            if file_name.endswith(".mp3"):
                file_pathname = os.path.join(folder_pathname, file_name)

                # Get the duration of the file using the mutagen library
                audio = MP3(file_pathname)
                duration = int(audio.info.length)

                # Create the object with the desired properties
                sound_object = {
                    "name": file_name[:-4],
                    "url": file_pathname,
                    "duration": duration,
                    "tags": [folder_name.lower()]
                }

                # Add the object to the array
                sound_objects.append(sound_object)

# Write the array to a JS file
with open("output.js", "w") as f:
    f.write("const SONGS = ")
    f.write(json.dumps(sound_objects))
    f.write(".map((song) => {\n")
    f.write("    song.audio = createAudioElement(song.url);\n")
    f.write("    return song;\n")
    f.write("  });\n")
