import fs from "fs";
import path from "path";

export function loadSyllabus(level, subject) {
  try {
    const filePath = path.join(
      process.cwd(),
      "syllabus",
      level,
      `${subject}.json`
    );

    if (!fs.existsSync(filePath)) return null;

    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}
