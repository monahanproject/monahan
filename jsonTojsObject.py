import json

# Read the JSON file
with open('data.json', 'r') as f:
    data = json.load(f)

# Convert to a list of dicts
js_list = []
for obj in data:
    js_obj = {}
    if "name" in obj:
        js_obj["name"] = obj["name"]
    if "url" in obj:
        js_obj["url"] = obj["url"]
    if "duration" in obj:
        js_obj["duration"] = obj["duration"]
    if "tags" in obj:
        js_obj["tags"] = obj["tags"]
    if "credit" in obj:
        js_obj["credit"] = obj["credit"]
    js_list.append(js_obj)

# Convert to a JavaScript array full of objects
js_array = json.dumps(js_list, indent=4)

# Write to a new file
with open('YojsonDataTojsObject.js', 'w') as f:
    f.write('var myArray = ')
    f.write(js_array)
    f.write(';')
