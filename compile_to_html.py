import csv
import re

# Define the CSS styles
css_styles = '''
<style>
.italic {font-style: italic;}
.bold {font-weight: bold;}
</style>
'''

# Function to replace pseudocode with HTML tags, including markdown-style links
def replace_pseudocode(text):
    # Replace italic pseudocode
    text = re.sub(r'\$([^$]+)\$\$', r'<span class="italic">\1</span>', text)
    # Replace bold pseudocode
    text = re.sub(r'\^([^\\^]+)\^\^', r'<span class="bold">\1</span>', text)
    # Correctly replace markdown-style links with HTML links
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a target="_blank" href="\2">\1</a>', text)
    return text

# Process CSV and generate HTML with English and French content separated
def process_csv_to_html_separated(input_csv_path, output_html_path):
    with open(input_csv_path, newline='', encoding='utf-8') as csvfile, open(output_html_path, 'w', encoding='utf-8') as htmlfile:
        reader = csv.DictReader(csvfile)
        htmlfile.write(css_styles + '\n')  # Write CSS styles at the beginning
        
        htmlfile.write('<div class="english-content">\n<h2>English Content</h2>\n')
        for row in reader:
            eng_html = replace_pseudocode(row['EngHTML'])
            htmlfile.write(eng_html + '\n')
        htmlfile.write('</div>\n')  # Close English content div

        # Reset the file pointer to the beginning of the CSV to process French content
        csvfile.seek(0)
        next(reader)  # Skip the header row

        htmlfile.write('<div class="french-content">\n<h2>French Content</h2>\n')
        for row in reader:
            fr_html = replace_pseudocode(row['FrHTML'])
            htmlfile.write(fr_html + '\n')
        htmlfile.write('</div>\n')  # Close French content div

input_csv_path = 'mon.csv'
output_html_path = 'output.html'

process_csv_to_html_separated(input_csv_path, output_html_path)

print("HTML file with separated English and French content and correctly formatted links has been generated successfully.")
