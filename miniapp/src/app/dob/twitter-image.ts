import fs from "fs";
import path from "path";

export const contentType = "image/png";
export const alt = "Astrology App";

export default function Image() {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "images",
      "embed",
      "twitter",
      "main.png",
    );
    const buffer = fs.readFileSync(filePath);

    return new Response(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error reading png file:", error);
    return new Response("Error loading image", { status: 500 });
  }
}
