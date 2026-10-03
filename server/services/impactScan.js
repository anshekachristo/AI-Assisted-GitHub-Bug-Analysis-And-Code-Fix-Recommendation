const fs = require('fs');
const path = require('path');

// Scans the repo for files that import/require the target file
function findReferencingFiles(repoPath, targetFile, allFiles) {
  const targetBaseName = path.basename(targetFile, path.extname(targetFile)); // e.g. "AxiosError" from "AxiosError.js"
  const referencingFiles = [];

  for (const file of allFiles) {
    if (file === targetFile) continue; // skip the file itself

    const fullPath = path.join(repoPath, file);
    let content;
    try {
      content = fs.readFileSync(fullPath, 'utf-8');
    } catch {
      continue; // skip unreadable files
    }

    const lines = content.split('\n');

    // A line is considered a reference if it looks like an import/require
    // statement AND mentions the target file's base name anywhere in it.
    const isReferenced = lines.some(line => {
      const looksLikeImport = /(\brequire\s*\(|\bimport\s|\bfrom\s+['"`])/.test(line);
      const mentionsFile = line.includes(targetBaseName);
      return looksLikeImport && mentionsFile;
    });

    if (isReferenced) {
      referencingFiles.push(file);
    }
  }

  return referencingFiles;
}

module.exports = { findReferencingFiles };