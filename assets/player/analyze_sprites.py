from PIL import Image
import os

FILES = [
    "hover_01.png",
    "flap_up.png",
    "flap_down.png",
    "quackers_master.png"
]

PREVIEW_WIDTH = 60
PREVIEW_HEIGHT = 36


def get_bbox(img):
    return img.getchannel("A").getbbox()


def get_center(img):
    alpha = img.getchannel("A")
    pixels = alpha.load()

    total = 0
    sum_x = 0
    sum_y = 0

    for y in range(img.height):
        for x in range(img.width):

            a = pixels[x, y]

            if a > 0:
                total += a
                sum_x += x * a
                sum_y += y * a

    if total == 0:
        return None

    return (
        sum_x / total,
        sum_y / total
    )


def make_preview(img):

    bbox = get_bbox(img)

    if not bbox:
        return "[NO ARTWORK]"

    cropped = img.crop(bbox)

    aspect = cropped.width / cropped.height

    width = PREVIEW_WIDTH

    height = int(
        width / aspect * 0.5
    )

    height = max(
        8,
        min(
            height,
            PREVIEW_HEIGHT
        )
    )

    small = cropped.resize(
        (width, height),
        Image.Resampling.LANCZOS
    )

    lines = []

    for y in range(height):

        line = ""

        for x in range(width):

            r, g, b, a = \
                small.getpixel((x, y))

            if a < 40:
                line += " "
                continue

            brightness = (
                0.299 * r +
                0.587 * g +
                0.114 * b
            )

            if brightness < 50:
                char = "@"
            elif brightness < 100:
                char = "#"
            elif brightness < 150:
                char = "*"
            elif brightness < 200:
                char = "."
            else:
                char = "+"

            line += char

        lines.append(line)

    return "\n".join(lines)


print()
print("=" * 70)
print("SGT. QUACKERS SPRITE ANALYSIS")
print("=" * 70)

for filename in FILES:

    print()
    print("=" * 70)
    print(f"FILE: {filename}")
    print("=" * 70)

    if not os.path.exists(filename):

        print("FILE NOT FOUND")
        continue

    img = Image.open(filename).convert("RGBA")

    print()
    print(
        f"Canvas: {img.width} × {img.height}"
    )

    bbox = get_bbox(img)

    if bbox:

        left, top, right, bottom = bbox

        width = right - left
        height = bottom - top

        print()
        print(
            f"Visible bounding box: "
            f"({left}, {top}) → "
            f"({right}, {bottom})"
        )

        print(
            f"Visible artwork size: "
            f"{width} × {height}"
        )

        print(
            f"Aspect ratio: "
            f"{width / height:.4f}"
        )

        print(
            f"Padding: "
            f"left={left}, "
            f"top={top}, "
            f"right={img.width - right}, "
            f"bottom={img.height - bottom}"
        )

    center = get_center(img)

    if center:

        cx, cy = center

        print()
        print(
            f"Artwork center: "
            f"({cx:.1f}, {cy:.1f})"
        )

        print(
            f"Canvas center: "
            f"({img.width / 2:.1f}, "
            f"{img.height / 2:.1f})"
        )

        print(
            f"Center offset: "
            f"X={cx - img.width / 2:.1f}, "
            f"Y={cy - img.height / 2:.1f}"
        )

    print()
    print("VISUAL SILHOUETTE:")
    print("-" * PREVIEW_WIDTH)

    print(
        make_preview(img)
    )

print()
print("=" * 70)
print("DONE")
print("=" * 70)
print()