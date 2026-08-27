from pathlib import Path
from PIL import Image, ImageDraw

target = Path(__file__).resolve().parents[1] / "client" / "public"

for size, name in [(192, "icon-192.png"), (512, "icon-512.png"), (180, "apple-touch-icon.png")]:
    image = Image.new("RGBA", (size, size), "#133D76")
    draw = ImageDraw.Draw(image)
    pad = int(size * 0.13)
    radius = int(size * 0.22)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill="#133D76")
    line = max(5, int(size * 0.055))
    pale = "#B9D5FF"
    white = "#FFFFFF"
    mid = size // 2
    top = int(size * 0.31)
    bottom = int(size * 0.70)
    draw.line([(pad, bottom), (pad, top), (mid, int(size * 0.37)), (mid, bottom)], fill=white, width=line, joint="curve")
    draw.line([(size-pad, bottom), (size-pad, top), (mid, int(size * 0.37)), (mid, bottom)], fill=white, width=line, joint="curve")
    draw.arc((int(size * 0.27), int(size * 0.12), int(size * 0.73), int(size * 0.44)), 200, 340, fill=pale, width=line)
    draw.arc((int(size * 0.34), int(size * 0.18), int(size * 0.66), int(size * 0.40)), 205, 335, fill=pale, width=max(4, line - 2))
    image.save(target / name)
