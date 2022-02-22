import Dexie from "dexie";

export const db = new Dexie("therapy");
db.version(1).stores({
  files: "++id, &filePath, title, artist, album, bpm, duration", // Primary key and indexed props
});
