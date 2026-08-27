from pathlib import Path
from PIL import Image, ImageDraw

target = Path(__file__).resolve().parents[1] / "client" / "public"

for size, name in [(192, "icon-192.png"), (512, "icon-512.png"), (180, "apple-touch-icon.png")]:
    image = Image.new("RGBA", (size, size), "#133D76")
    draw = ImageDraw.Draw(image)
    radius = int(size * 0.22)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill="#133D76")

    line = max(5, int(size * 0.055))
    pale, gold, white = "#B9D5FF", "#C79A2B", "#FFFFFF"
    mid, bottom = size // 2, int(size * 0.70)
    mast_top, beam_y, base_y = int(size * 0.20), int(size * 0.36), int(size * 0.70)
    left, right = int(size * 0.24), int(size * 0.76)

    # A simplified gold balance scale inspired by the supplied book cover.
    draw.line([(mid, mast_top), (mid, base_y)], fill=gold, width=line, joint="curve")
    draw.line([(left, beam_y), (right, beam_y)], fill=gold, width=line, joint="curve")
    draw.ellipse((mid - line, mast_top - line, mid + line, mast_top + line), fill=gold)
    for x, direction in [(left, -1), (right, 1)]:
        outer, inner = x + direction * int(size * 0.06), x - direction * int(size * 0.06)
        draw.line([(x, beam_y), (outer, int(size * 0.56))], fill=gold, width=max(3, line - 2))
        draw.line([(x, beam_y), (inner, int(size * 0.56))], fill=gold, width=max(3, line - 2))
        draw.arc((x - int(size * 0.11), int(size * 0.47), x + int(size * 0.11), int(size * 0.65)), 0, 180, fill=gold, width=max(3, line - 2))
    draw.rounded_rectangle((int(size * 0.34), base_y, int(size * 0.66), int(size * 0.76)), radius=max(3, line), fill=gold)

    # A minimal open ledger sits below the balanced scale.
    draw.line([(int(size * 0.23), bottom), (int(size * 0.23), int(size * 0.78)), (mid, int(size * 0.83)), (mid, bottom)], fill=white, width=max(3, line - 2), joint="curve")
    draw.line([(int(size * 0.77), bottom), (int(size * 0.77), int(size * 0.78)), (mid, int(size * 0.83)), (mid, bottom)], fill=white, width=max(3, line - 2), joint="curve")
    draw.arc((int(size * 0.27), int(size * 0.08), int(size * 0.73), int(size * 0.30)), 200, 340, fill=pale, width=max(3, line - 2))
    image.save(target / name)
