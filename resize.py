import sys
from PIL import Image

def pad_icon(input_path, output_path, scale_factor=0.66):
    try:
        # Open the original icon
        img = Image.open(input_path).convert("RGBA")
        
        # Calculate new size based on scale factor
        target_size = 1024
        inner_size = int(target_size * scale_factor)
        
        # Calculate the aspect ratio preserving resize
        ratio = min(inner_size / img.width, inner_size / img.height)
        new_width = int(img.width * ratio)
        new_height = int(img.height * ratio)
        
        img_resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Create a new transparent image
        new_img = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))
        
        # Paste the resized image into the center
        x = (target_size - new_width) // 2
        y = (target_size - new_height) // 2
        new_img.paste(img_resized, (x, y), img_resized)
        
        new_img.save(output_path)
        print(f"Successfully saved padded icon to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    pad_icon('assets/s_icon.png', 'assets/s_icon_adaptive.png')
