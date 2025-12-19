import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const files = fs.readdirSync(publicDir);

    // Filter for numbered pngs or just standard pngs
    // Based on user files seen: 1.png, 2.png ... 30.png
    const avatarFiles = files
      .filter((file) => {
        return file.endsWith(".png") && !isNaN(parseInt(file.split(".")[0]));
      })
      .sort((a, b) => {
        // Natural sort
        return parseInt(a) - parseInt(b);
      });

    return NextResponse.json({ avatars: avatarFiles });
  } catch (error) {
    console.error("Error listing avatars:", error);
    return NextResponse.json(
      { error: "Failed to list avatars" },
      { status: 500 }
    );
  }
}
