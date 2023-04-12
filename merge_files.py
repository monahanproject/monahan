# turn the csv into a json and turn the data into a json and then this will work

import sys
import json

# Check if the correct number of arguments was provided
if len(sys.argv) != 3:
    print("Usage: python merge_files.py data.json csv.json")
    sys.exit()

# Open the files and load the JSON data
try:
    with open(sys.argv[1], "r") as data_file:
        data = json.load(data_file)
    with open(sys.argv[2], "r") as csv_file:
        csv_data = json.load(csv_file)
except IOError:
    print("Error: File not found")
    sys.exit()

# Convert the data list to a dictionary using the name field as the key
data_dict = {item["name"]: item for item in data}

# Merge the files by updating the data_dict with the csv_data
for item in csv_data:
    if item["name"] in data_dict:
        data_dict[item["name"]].update(item)
    else:
        data_dict[item["name"]] = item

# Convert the dictionary back to a list
data = list(data_dict.values())

# Save the merged data back to the data.json file
with open(sys.argv[1], "w") as data_file:
    json.dump(data, data_file, indent=4)

print("Files merged successfully!")
