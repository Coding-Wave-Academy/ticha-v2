import fs from "fs";

const filePath = "c:/Users/krisk/ticha-v2/ticha-frontend/src/screens/Chat.jsx";
let content = fs.readFileSync(filePath, "utf8");

// Regex to match // #region agent log ... // #endregion and anything in between
// Also match cases where it's not starting with // #region but contains the fetch
const logRegex = /\/\/ #region agent log[\s\S]*?\/\/ #endregion/g;
const fetchRegex =
  /fetch\('http:\/\/127\.0\.0\.1:7242\/ingest\/[\s\S]*?\}\)\.catch\(\(\)\s*=>\s*\{\}\);/g;
const fetchRegex2 =
  /fetch\(\s*"http:\/\/127\.0\.0\.1:7242\/ingest\/[\s\S]*?\}\s*\)\.catch\(\(\)\s*=>\s*\{\}\);/g;

content = content.replace(logRegex, "");
content = content.replace(fetchRegex, "");
content = content.replace(fetchRegex2, "");

// Clean up extra double newlines
content = content.replace(/\n\s*\n\s*\n/g, "\n\n");

fs.writeFileSync(filePath, content);
console.log("Cleaned Chat.jsx");
