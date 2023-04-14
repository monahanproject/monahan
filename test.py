# open the input file for reading
with open("input.txt", "r") as f:
    # read the entire file into a string
    data = f.read()

# find all sections that start with "tags: [" and end with "]"
sections = []
start = 0
while True:
    start = data.find("tags: [", start)
    if start == -1:
        break
    end = data.find("]", start)
    if end == -1:
        break
    sections.append(data[start:end+1])
    start = end + 1

# process each section
for section in sections:
    # find all commas within the section
    commas = []
    start = 0
    while True:
        start = section.find(",", start)
        if start == -1:
            break
        commas.append(start)
        start += 1

    # insert double quotes before and after each comma
    new_section = section
    for i in reversed(commas):
        new_section = new_section[:i] + '"' + new_section[i+1:]
    for i in reversed(commas):
        new_section = new_section[:i] + '"' + new_section[i:]

    # replace the original section with the modified one
    data = data.replace(section, new_section)

# open the output file for writing and write the modified data
with open("output.txt", "w") as f:
    f.write(data)