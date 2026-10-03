// Extracts the code block from AI's response, which looks like:
// EXPLANATION:
// ...text...
// FIXED_CODE:
// ```javascript
// ...code...
// ```

/**
 * Apply a unified diff patch to original text if the AI returned a diff instead of full code.
 */
function applyUnifiedDiff(original, patch) {
  try {
    const lines = patch.split(/\r?\n/);
    const origLines = original.split(/\r?\n/);
    let result = [];
    let origIdx = 0;
    let inHunk = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('@@')) {
        const match = line.match(/@@\s+-(\d+)(?:,\d+)?\s+\+(\d+)(?:,\d+)?\s+@@/);
        if (match) {
          const startLine = parseInt(match[1], 10) - 1; // 0-indexed
          while (origIdx < startLine && origIdx < origLines.length) {
            result.push(origLines[origIdx++]);
          }
          inHunk = true;
          continue;
        }
      }
      if (inHunk) {
        if (line.startsWith('+') && !line.startsWith('+++')) {
          result.push(line.slice(1));
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          origIdx++; // skip deleted line in original
        } else if (line.startsWith(' ')) {
          result.push(line.slice(1));
          origIdx++;
        }
      }
    }

    while (origIdx < origLines.length) {
      result.push(origLines[origIdx++]);
    }

    return result.length > 0 ? result.join('\n') : null;
  } catch (err) {
    console.warn('[DIFF] Unified diff parsing failed:', err.message);
    return null;
  }
}

function extractFixedCode(aiResponse, originalCode = '') {
  if (!aiResponse || typeof aiResponse !== 'string') return '';

  let codePart = aiResponse;
  const fixedCodeIndex = aiResponse.indexOf('FIXED_CODE:');
  if (fixedCodeIndex !== -1) {
    codePart = aiResponse.slice(fixedCodeIndex + 'FIXED_CODE:'.length);
  }

  // Match code block with any language tag or none, handling both LF and CRLF
  const codeBlockMatch = codePart.match(/```[a-zA-Z0-9_-]*\r?\n([\s\S]*?)```/);
  let extracted = codeBlockMatch ? codeBlockMatch[1].trim() : null;

  if (!extracted) {
    // Check if entire aiResponse had a code block
    const anyBlockMatch = aiResponse.match(/```[a-zA-Z0-9_-]*\r?\n([\s\S]*?)```/);
    if (anyBlockMatch) {
      extracted = anyBlockMatch[1].trim();
    }
  }

  // Fallback: if no code block markers found, take everything after "FIXED_CODE:"
  if (!extracted && fixedCodeIndex !== -1) {
    extracted = codePart.trim();
  }

  if (!extracted) {
    extracted = aiResponse.trim();
  }

  // Remove any lingering ``` fences
  extracted = extracted.replace(/^```[a-zA-Z0-9_-]*\r?\n?/, '').replace(/\r?\n?```$/, '').trim();

  // If the extracted content is a unified diff/patch and we have originalCode, reconstruct full file
  if (originalCode && (extracted.includes('@@') && (extracted.startsWith('---') || extracted.startsWith('diff --git') || extracted.includes('\n@@')))) {
    const patched = applyUnifiedDiff(originalCode, extracted);
    if (patched) {
      return patched;
    }
  }

  return extracted;
}

function extractExplanation(aiResponse) {
  if (!aiResponse || typeof aiResponse !== 'string') return '';
  const match = aiResponse.match(/EXPLANATION:\s*([\s\S]*?)(?:\r?\n\s*FIXED_CODE:|$)/i);
  return match ? match[1].trim() : '';
}

module.exports = { extractFixedCode, extractExplanation, applyUnifiedDiff };