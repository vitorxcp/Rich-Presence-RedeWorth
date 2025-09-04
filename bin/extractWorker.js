const AdmZip = require("adm-zip");

process.on("message", ({ zipPath, extractPath }) => {
  try {
    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();
    const totalFiles = zipEntries.length;
    let extracted = 0;

    for (const entry of zipEntries) {
      zip.extractEntryTo(entry, extractPath, true, true);
      extracted++;
      const percent = Math.round((extracted / totalFiles) * 100);
      process.send({ type: "progress", percent });
    }

    process.send({ type: "done" });
  } catch (err) {
    console.error("[Worker Error]", err);
    process.exit(1);
  }
});
