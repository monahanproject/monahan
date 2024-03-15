import json
from mutagen.mp3 import MP3

# Load the JSON data from the file
with open('songs.json', 'r') as json_file:
    songs_data = json.load(json_file)

# Initialize a counter for changed durations
changed_durations_count = 0

# Iterate through the songs in the JSON
for song in songs_data:
    url = song['url']
    
    # Extract the duration of the MP3 file
    try:
        audio = MP3(url)
        duration_seconds = int(audio.info.length)
        # Check if the duration has changed
        if 'duration' in song and song['duration'] != duration_seconds:
            changed_durations_count += 1
            song['duration'] = duration_seconds  # Update the duration in the JSON
        elif 'duration' not in song:
            changed_durations_count += 1  # Count as changed if duration was missing
            song['duration'] = duration_seconds
    except Exception as e:
        print(f"Error reading duration for {url}: {e}")
        duration_seconds = None
        if 'duration' in song:
            changed_durations_count += 1  # Count as changed if unable to read and duration exists
        song['duration'] = 0  # Set duration to 0 if error occurs

# Save the updated JSON
with open('updated_songs.json', 'w') as updated_json_file:
    json.dump(songs_data, updated_json_file, indent=4)

print(f"JSON updated with MP3 durations. Number of changed durations: {changed_durations_count}.")
