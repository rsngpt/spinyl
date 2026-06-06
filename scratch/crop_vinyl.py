from PIL import Image
import numpy as np

def process_vinyl():
    # Load original image (we need to restore from backup if we modified it, but wait!
    # The previous run modified public/vinyl-10-gold.png directly.
    # Let's see if we can find if there is a backup or if we can run it again.
    # Wait, the previous crop padded it to 538x538, which is already a square, but let's check
    # if the circle was off-center or if it looks correct.
    # Let's write a robust script that runs on the current image.
    img_path = "public/vinyl-10-gold.png"
    img = Image.open(img_path).convert("RGBA")
    
    # Convert to numpy array to analyze alpha channel
    data = np.array(img)
    alpha = data[:, :, 3]
    
    # Find pixels with alpha > 100 (solid part of the vinyl, ignoring soft shadow edges if any)
    y_indices, x_indices = np.where(alpha > 100)
    
    if len(y_indices) == 0:
        print("Error: No pixels with alpha > 100 found")
        return
        
    min_y, max_y = np.min(y_indices), np.max(y_indices)
    min_x, max_x = np.min(x_indices), np.max(x_indices)
    
    print(f"Solid bounding box: x={min_x}..{max_x}, y={min_y}..{max_y}")
    
    center_x = (min_x + max_x) / 2.0
    center_y = (min_y + max_y) / 2.0
    
    width = max_x - min_x
    height = max_y - min_y
    size = max(width, height)
    
    print(f"Solid center: x={center_x}, y={center_y}, width={width}, height={height}")
    
    # Let's crop a square centered at (center_x, center_y) with size + small margin
    margin = 8
    half_size = int((size / 2.0) + margin)
    
    new_left = int(center_x - half_size)
    new_top = int(center_y - half_size)
    new_right = int(center_x + half_size)
    new_bottom = int(center_y + half_size)
    
    new_width = new_right - new_left
    new_height = new_bottom - new_top
    
    # Create new transparent canvas
    output_img = Image.new("RGBA", (new_width, new_height), (0, 0, 0, 0))
    
    # Crop from original image, padding if out of bounds
    cropped = img.crop((new_left, new_top, new_right, new_bottom))
    output_img.paste(cropped, (0, 0))
    
    # Save the processed image back
    output_img.save("public/vinyl-10-gold.png")
    print(f"Saved cropped centered square vinyl image to public/vinyl-10-gold.png with size {new_width}x{new_height}")

if __name__ == "__main__":
    process_vinyl()
