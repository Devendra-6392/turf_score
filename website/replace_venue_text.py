import os

directory = r'd:\Work-Space\Industrial Prijects\turf_score\website'

count = 0
for root, dirs, files in os.walk(directory):
    for filename in files:
        if filename.endswith('.html') or filename.endswith('.js'):
            filepath = os.path.join(root, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace "Pay at Venue" with "Pay at Turf"
                new_content = content.replace('Pay at Venue', 'Pay at Turf')
                # Replace other instances of Venue with Turf where it makes sense in text
                # To be safe, we only target specific phrases if necessary, 
                # but " Venue" -> " Turf" is pretty safe.
                new_content = new_content.replace(' Venue', ' Turf')
                new_content = new_content.replace('>Venue', '>Turf')
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    count += 1
            except Exception as e:
                pass

print(f'Replaced Venue with Turf in {count} files')
