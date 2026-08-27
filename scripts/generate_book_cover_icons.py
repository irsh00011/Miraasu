from pathlib import Path
from PIL import Image

project = Path(__file__).resolve().parents[1]
source = Path("/home/ubuntu/webdev-static-assets/miraath-book-cover-reference.png")
target = project / "client" / "public"

with Image.open(source) as image:
    # The supplied image is a full book spread. This crop keeps its front cover intact.
    front_cover = image.convert("RGB").crop((805, 35, 1342, 890))
    for size, name in [(192, "book-cover-icon-192.png"), (512, "book-cover-icon-512.png"), (180, "book-cover-apple-touch-icon.png")]:
        canvas = Image.new("RGB", (size, size), "#132C5E")
        cover = front_cover.copy()
        cover.thumbnail((int(size * 0.80), int(size * 0.90)), Image.Resampling.LANCZOS)
        x = (size - cover.width) // 2
        y = (size - cover.height) // 2
        canvas.paste(cover, (x, y))
        canvas.save(target / name, optimize=True)
