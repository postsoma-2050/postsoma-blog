import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import numpy as np

def create_og_master():
    WIDTH = 1200
    HEIGHT = 630

    # 1. Base Canvas - Deep Cyberpunk Olive-Graphite Gradient
    canvas = Image.new("RGB", (WIDTH, HEIGHT), (7, 12, 8))
    draw = ImageDraw.Draw(canvas)

    # Subtle vertical background gradient
    for y in range(HEIGHT):
        ratio = y / HEIGHT
        r = int(6 + 5 * (1 - ratio))
        g = int(10 + 9 * (1 - ratio))
        b = int(7 + 6 * (1 - ratio))
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    # Subtle cyberpunk grid (40px spacing, very faint)
    grid_spacing = 40
    grid_color = (16, 26, 18)
    for x in range(0, WIDTH, grid_spacing):
        draw.line([(x, 0), (x, HEIGHT)], fill=grid_color, width=1)
    for y in range(0, HEIGHT, grid_spacing):
        draw.line([(0, y), (WIDTH, y)], fill=grid_color, width=1)

    # 2. Source extraction from public/no-future.jpg
    src = Image.open("public/no-future.jpg").convert("RGB")
    
    # 2a. Extract Calligraphy: "愛 權 色 名 利" (y: 322 to 412)
    calligraphy_raw = src.crop((15, 322, 865, 412))
    cal_arr = np.array(calligraphy_raw).astype(np.float32)
    mask = cal_arr.mean(axis=-1)
    
    # Clean up background noise, make calligraphy pure luminous warm-white
    char_factor = np.clip((mask - 22) / 75.0, 0, 1)
    cal_alpha = np.clip((mask - 18) * 4.0, 0, 255).astype(np.uint8)
    
    cal_white = np.ones_like(cal_arr, dtype=np.uint8) * 250
    cal_white[..., 2] = 240  # Slight warm tint
    calligraphy_rgba = Image.new("RGBA", calligraphy_raw.size, (255, 255, 255, 0))
    calligraphy_rgba.paste(Image.fromarray(cal_white), (0, 0), Image.fromarray(cal_alpha))

    # 2b. Extract Boy Artwork (clean crop: y 560 to 1373 to avoid any boundary lines)
    boy_raw = src.crop((0, 560, 887, 1373))
    
    # 2c. Extract "animal?" (y: 1368 to 1475)
    animal_raw = src.crop((55, 1368, 845, 1475))
    anim_arr = np.array(animal_raw).astype(np.float32)
    r_chan = anim_arr[..., 0]
    g_chan = anim_arr[..., 1]
    b_chan = anim_arr[..., 2]
    
    # Isolate the red text strongly
    anim_alpha = np.clip((r_chan - 15) * 3.5, 0, 255).astype(np.uint8)
    anim_colored = np.zeros_like(anim_arr, dtype=np.uint8)
    # Intense luminous crimson red
    anim_colored[..., 0] = np.clip(r_chan * 2.4 + 60, 0, 255)
    anim_colored[..., 1] = np.clip(g_chan * 0.2, 0, 40)
    anim_colored[..., 2] = np.clip(b_chan * 0.2, 0, 40)
    animal_rgba = Image.new("RGBA", animal_raw.size, (0, 0, 0, 0))
    animal_rgba.paste(Image.fromarray(anim_colored), (0, 0), Image.fromarray(anim_alpha))

    # 3. Boy Frame on the Right
    target_h = 504
    scale = target_h / boy_raw.height
    target_w = int(boy_raw.width * scale)
    boy_resized = boy_raw.resize((target_w, target_h), Image.Resampling.LANCZOS)

    boy_x = WIDTH - target_w - 44  # ~608
    boy_y = (HEIGHT - target_h) // 2  # 63

    # Viewfinder border for the boy
    pad = 4
    vf_x1 = boy_x - pad
    vf_y1 = boy_y - pad
    vf_x2 = boy_x + target_w + pad
    vf_y2 = boy_y + target_h + pad

    # Dark backdrop for boy
    draw.rectangle([vf_x1 - 2, vf_y1 - 2, vf_x2 + 2, vf_y2 + 2], fill=(3, 6, 3))
    canvas.paste(boy_resized, (boy_x, boy_y))

    # Add soft edge vignette to boy left and right so it blends seamlessly
    vignette = Image.new("L", (target_w, target_h), 255)
    v_draw = ImageDraw.Draw(vignette)
    vig_w = 24
    for i in range(vig_w):
        val = int(255 * (i / vig_w))
        v_draw.line([(i, 0), (i, target_h)], fill=val)
        v_draw.line([(target_w - 1 - i, 0), (target_w - 1 - i, target_h)], fill=val)
    black_cover = Image.new("RGB", (target_w, target_h), (5, 9, 5))
    inv_vig = Image.eval(vignette, lambda x: 255 - x)
    canvas.paste(black_cover, (boy_x, boy_y), inv_vig)

    # Viewport Frame Lines
    draw.rectangle([vf_x1, vf_y1, vf_x2, vf_y2], outline=(38, 62, 48), width=1)
    
    # Corner tech ticks for viewport
    tick_len = 16
    draw.line([(vf_x1, vf_y1), (vf_x1 + tick_len, vf_y1)], fill=(0, 240, 255), width=2)
    draw.line([(vf_x1, vf_y1), (vf_x1, vf_y1 + tick_len)], fill=(0, 240, 255), width=2)
    draw.line([(vf_x2, vf_y1), (vf_x2 - tick_len, vf_y1)], fill=(0, 240, 255), width=2)
    draw.line([(vf_x2, vf_y1), (vf_x2, vf_y1 + tick_len)], fill=(0, 240, 255), width=2)
    draw.line([(vf_x1, vf_y2), (vf_x1 + tick_len, vf_y2)], fill=(0, 240, 255), width=2)
    draw.line([(vf_x1, vf_y2), (vf_x1, vf_y2 - tick_len)], fill=(0, 240, 255), width=2)
    draw.line([(vf_x2, vf_y2), (vf_x2 - tick_len, vf_y2)], fill=(0, 240, 255), width=2)
    draw.line([(vf_x2, vf_y2), (vf_x2, vf_y2 - tick_len)], fill=(0, 240, 255), width=2)

    # 4. Left Panel Typography & Composition
    left_x = 48
    left_max_w = boy_x - left_x - 36  # ~524px

    # Load Fonts
    font_mono_xl = None
    font_mono_lg = None
    font_mono_md = None
    font_mono_sm = None
    font_mono_xs = None
    for p in ["/System/Library/Fonts/Menlo.ttc", "/System/Library/Fonts/SFNSMono.ttf", "/System/Library/Fonts/Monaco.ttf"]:
        if os.path.exists(p):
            try:
                font_mono_xl = ImageFont.truetype(p, 24)
                font_mono_lg = ImageFont.truetype(p, 18)
                font_mono_md = ImageFont.truetype(p, 13)
                font_mono_sm = ImageFont.truetype(p, 11)
                font_mono_xs = ImageFont.truetype(p, 9)
                break
            except Exception:
                pass
    if not font_mono_lg:
        font_mono_xl = font_mono_lg = font_mono_md = font_mono_sm = font_mono_xs = ImageFont.load_default()

    # 4a. Header Badge: [ ● POSTSOMA 2050 ] // ARCHIVE
    badge_y = 65
    # Green pulse dot
    draw.ellipse([(left_x, badge_y + 4), (left_x + 8, badge_y + 12)], fill=(0, 255, 65))
    draw.text((left_x + 18, badge_y), "POSTSOMA 2050", fill=(245, 250, 245), font=font_mono_xl)
    
    # Calculate exact width of POSTSOMA 2050
    ps_bbox = font_mono_xl.getbbox("POSTSOMA 2050")
    ps_width = ps_bbox[2] - ps_bbox[0]
    slash_x = left_x + 18 + ps_width + 12
    draw.text((slash_x, badge_y), "/", fill=(0, 240, 255), font=font_mono_xl)
    draw.text((slash_x + 16, badge_y), "ARCHIVE", fill=(140, 165, 145), font=font_mono_xl)

    # Sub-tag: SPECIMEN CLASSIFICATION
    draw.text((left_x, badge_y + 34), "COGNITIVE ARCHITECTURE · HIGH-TECH MEETS HIGH-TOUCH", fill=(85, 120, 92), font=font_mono_sm)

    # Divider line
    div_y = badge_y + 56
    draw.line([(left_x, div_y), (left_x + left_max_w, div_y)], fill=(32, 52, 38), width=1)
    draw.rectangle([left_x, div_y - 1, left_x + 48, div_y + 1], fill=(0, 240, 255))

    # 4b. Calligraphy: 「愛 權 色 名 利」
    cal_target_w = left_max_w
    cal_scale = cal_target_w / calligraphy_rgba.width
    cal_target_h = int(calligraphy_rgba.height * cal_scale)
    cal_resized = calligraphy_rgba.resize((cal_target_w, cal_target_h), Image.Resampling.LANCZOS)
    
    cal_y = div_y + 20
    canvas.paste(cal_resized, (left_x, cal_y), cal_resized)

    # Micro label under calligraphy
    label_y = cal_y + cal_target_h + 10
    draw.text((left_x, label_y), "DESIRE MATRIX // LOVE · POWER · LUST · FAME · WEALTH", fill=(110, 140, 115), font=font_mono_xs)

    # 4c. Middle Badge: "NO FUTURE // EXISTENTIAL QUERY"
    mid_y = label_y + 34
    draw.rectangle([left_x, mid_y, left_x + left_max_w, mid_y + 44], fill=(11, 20, 13), outline=(36, 62, 42), width=1)
    # Left accent green block
    draw.rectangle([left_x, mid_y, left_x + 6, mid_y + 44], fill=(0, 255, 65))
    draw.text((left_x + 18, mid_y + 8), "PHILOSOPHY // AI // BLOCKCHAIN // INVESTING", fill=(195, 215, 200), font=font_mono_md)
    draw.text((left_x + 18, mid_y + 26), "SYSTEM NODE 2050 // AUTONOMOUS KNOWLEDGE GARDEN", fill=(95, 125, 100), font=font_mono_xs)

    # 4d. "animal?" typography (Vibrant Neon Blood-Red)
    anim_target_w = int(left_max_w * 0.94)
    anim_scale = anim_target_w / animal_rgba.width
    anim_target_h = int(animal_rgba.height * anim_scale)
    anim_resized = animal_rgba.resize((anim_target_w, anim_target_h), Image.Resampling.LANCZOS)
    
    anim_y = mid_y + 68
    
    # Intense red underglow behind animal
    glow_box = Image.new("RGBA", (anim_target_w + 60, anim_target_h + 40), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_box)
    glow_draw.ellipse([15, 8, anim_target_w + 45, anim_target_h + 32], fill=(240, 25, 25, 75))
    glow_box = glow_box.filter(ImageFilter.GaussianBlur(18))
    canvas.paste(glow_box, (left_x - 15, anim_y - 12), glow_box)
    
    canvas.paste(anim_resized, (left_x + 6, anim_y), anim_resized)

    # Label under animal
    anim_sub_y = anim_y + anim_target_h + 8
    draw.text((left_x + 8, anim_sub_y), "BIOLOGICAL FOUNDATION VS. SYNTHETIC TRANSCENDENCE", fill=(200, 70, 70), font=font_mono_xs)

    # 4e. Left Footer stats
    l_foot_y = 548
    draw.line([(left_x, l_foot_y), (left_x + left_max_w, l_foot_y)], fill=(28, 46, 32), width=1)
    draw.text((left_x, l_foot_y + 8), "LAT: 2050.X // CIPHER: ANTHROPOS // VER: 2.5", fill=(75, 105, 80), font=font_mono_xs)

    # 5. INDUSTRIAL HUD BORDER & OVERLAY (Self-Contained Edge Framing)
    inset = 22
    f_x1, f_y1 = inset, inset
    f_x2, f_y2 = WIDTH - inset, HEIGHT - inset

    # Outer border line
    draw.rectangle([f_x1, f_y1, f_x2, f_y2], outline=(36, 56, 40), width=1)

    # Corner Reticles / Brackets [ + ]
    c_len = 22
    # Top-Left
    draw.line([(f_x1, f_y1), (f_x1 + c_len, f_y1)], fill=(0, 240, 255), width=2)
    draw.line([(f_x1, f_y1), (f_x1, f_y1 + c_len)], fill=(0, 240, 255), width=2)
    draw.rectangle([f_x1 + 4, f_y1 + 4, f_x1 + 8, f_y1 + 8], fill=(0, 255, 65))

    # Top-Right
    draw.line([(f_x2, f_y1), (f_x2 - c_len, f_y1)], fill=(0, 240, 255), width=2)
    draw.line([(f_x2, f_y1), (f_x2, f_y1 + c_len)], fill=(0, 240, 255), width=2)
    draw.rectangle([f_x2 - 8, f_y1 + 4, f_x2 - 4, f_y1 + 8], fill=(0, 255, 65))

    # Bottom-Left
    draw.line([(f_x1, f_y2), (f_x1 + c_len, f_y2)], fill=(0, 240, 255), width=2)
    draw.line([(f_x1, f_y2), (f_x1, f_y2 - c_len)], fill=(0, 240, 255), width=2)
    draw.rectangle([f_x1 + 4, f_y2 - 8, f_x1 + 8, f_y2 - 4], fill=(0, 255, 65))

    # Bottom-Right
    draw.line([(f_x2, f_y2), (f_x2 - c_len, f_y2)], fill=(0, 240, 255), width=2)
    draw.line([(f_x2, f_y2), (f_x2, f_y2 - c_len)], fill=(0, 240, 255), width=2)
    draw.rectangle([f_x2 - 8, f_y2 - 8, f_x2 - 4, f_y2 - 4], fill=(0, 255, 65))

    # Header tags on border
    draw.text((f_x1 + 30, f_y1 - 7), " POSTSOMA 2050 // TRANSMISSION CARD ", fill=(0, 240, 255), font=font_mono_xs)
    draw.text((f_x2 - 170, f_y1 - 7), " STATUS: BROADCASTING ", fill=(0, 255, 65), font=font_mono_xs)

    # Footer tags on border
    draw.text((f_x1 + 30, f_y2 - 5), " RATIO: 1.91:1 [1200x630] // SAFE-ZONE GUARANTEED ", fill=(95, 125, 100), font=font_mono_xs)
    draw.text((f_x2 - 190, f_y2 - 5), " https://www.postsoma-2050.com ", fill=(140, 170, 145), font=font_mono_xs)

    # Subtle film grain / noise overlay across canvas
    np_canvas = np.array(canvas)
    noise = np.random.normal(0, 3.0, np_canvas.shape).astype(np.float32)
    noisy_canvas = np.clip(np_canvas.astype(np.float32) + noise, 0, 255).astype(np.uint8)
    final_img = Image.fromarray(noisy_canvas)

    # Save to public/og-image.png
    final_img.save("public/og-image.png", "PNG", optimize=True)
    # Save as public/no-future-og.jpg
    final_img.convert("RGB").save("public/no-future-og.jpg", "JPEG", quality=95)
    
    # Also backup original no-future.jpg to no-future-original.jpg if not backed up
    if not os.path.exists("public/no-future-original.jpg"):
        src.save("public/no-future-original.jpg", "JPEG", quality=95)
    
    # Overwrite no-future.jpg with the 1200x630 master image so any existing cached scrapers get the perfect card!
    final_img.convert("RGB").save("public/no-future.jpg", "JPEG", quality=95)

    # Save preview to artifacts
    artifacts_dir = "/Users/jameswei/.gemini/antigravity-ide/brain/eb1866b4-adae-442f-8334-65022f06839e"
    final_img.save(os.path.join(artifacts_dir, "og_master_preview.png"), "PNG")
    print("Refined OG Master Card generated successfully!")
    print(f"Size: {final_img.size}")

if __name__ == "__main__":
    create_og_master()
