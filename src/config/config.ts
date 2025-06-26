import fs from "fs";
import path from "path";

function createFileIfNotExists() {
  const folderPath = path.join("src", "data");
  const filePath = path.join(folderPath, "posts.json");

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
  }

  return filePath;
}

export default createFileIfNotExists;
// Add other configuration functions or constants here;
