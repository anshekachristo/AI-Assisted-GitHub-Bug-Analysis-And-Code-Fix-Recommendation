const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const AVAILABLE_MODELS = {
  'allam-2-7b': 'allam-2-7b',
  'gpt-oss-120b': 'openai/gpt-oss-120b',
  'qwen3.6-27b': 'qwen/qwen3.6-27b'
};

const DEFAULT_MODEL = 'gpt-oss-120b';

function resolveModel(modelKey) {
  return AVAILABLE_MODELS[modelKey] || AVAILABLE_MODELS[DEFAULT_MODEL];
}

async function callGroq(modelId, prompt, maxTokens) {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: modelId,
      temperature: 0.2,
      max_tokens: maxTokens
    });
    const result = completion.choices[0].message.content.trim();
    console.log(`>>> [${modelId}] response length: ${result.length} chars`);
console.log(`>>> [${modelId}] last 100 chars: ...${result.slice(-100)}`);

    if (!result) {
      throw new Error(`Model "${modelId}" returned an empty response — it may have used all its tokens on internal reasoning. Try increasing max_tokens.`);
    }

    return result;
  } catch (err) {
    if (err.message && err.message.includes('decommissioned')) {
      throw new Error(`Model "${modelId}" has been deprecated by Groq. Please select a different model.`);
    }
    throw err;
  }
}

async function locateFile(issueTitle, issueBody, fileList, modelKey) {
  const modelId = resolveModel(modelKey);

  const prompt = `
You are a senior software engineer debugging a GitHub issue.

ISSUE TITLE: ${issueTitle}

ISSUE DESCRIPTION:
${issueBody}

Here is a list of files in the repository:
${fileList.join('\n')}

Based on the issue description, which ONE file is most likely responsible for this bug?
Respond with ONLY the exact file path from the list above, nothing else. No explanation, no markdown, just the path.
`;

  return callGroq(modelId, prompt, 1024);
}

async function suggestFix(issueTitle, issueBody, fileName, fileContent, modelKey) {
  const modelId = resolveModel(modelKey);

  const MAX_CHARS = 8000;
  let truncatedContent = fileContent;
  let wasTruncated = false;

  if (fileContent.length > MAX_CHARS) {
    truncatedContent = fileContent.slice(0, MAX_CHARS);
    wasTruncated = true;
  }

  const prompt = `
You are a senior software engineer fixing a bug.

ISSUE TITLE: ${issueTitle}

ISSUE DESCRIPTION:
${issueBody}

FILE: ${fileName}
${wasTruncated ? '(NOTE: This file was truncated due to length. Focus on fixing the visible portion related to the issue.)' : ''}

CURRENT FILE CONTENT:
${truncatedContent}

Analyze the bug and provide a fix.

Respond in EXACTLY this format, nothing else:

EXPLANATION:
(1-3 sentences explaining the root cause and the fix)

FIXED_CODE:
(the COMPLETE corrected file content, ready to replace the original file entirely)
`;

  return callGroq(modelId, prompt, 4000);
}

module.exports = { locateFile, suggestFix, AVAILABLE_MODELS };