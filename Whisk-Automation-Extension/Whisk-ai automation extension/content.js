// content.js
// Whisk automation: set prompt input, submit, wait for reply, repeat.

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) return;

  if (msg.type === 'WHISK_AUTOMATE') {
    (async () => {
      try {
        // Ask user for delay (in seconds)
        let delaySeconds = parseInt(prompt("Enter delay time in seconds:", "7"), 10);
        if (isNaN(delaySeconds) || delaySeconds <= 0) delaySeconds = 7; // fallback default
        const delayMs = delaySeconds * 1000;

        await automatePrompts(msg.prompts, delayMs);
        sendResponse({ status: 'done' });
      } catch (err) {
        console.error('Automation error', err);
        sendResponse({ status: 'error', message: err.message || String(err) });
      }
    })();
    return true;
  }

  if (msg.type === 'WHISK_TEST_SELECTORS') {
    try {
      const input = findPromptInput();
      const reply = findReplyContainer();
      let message = '';
      message += input ? `Input FOUND (tag: ${input.tagName.toLowerCase()})\n` : 'Input NOT found\n';
      message += reply ? `Reply container FOUND (children: ${reply.children.length})\n` : 'Reply container NOT found\n';
      sendResponse({ message });
    } catch (err) {
      sendResponse({ message: 'Error testing selectors: ' + err.message });
    }
    return true;
  }
});

// ---------- Helpers ----------
function isVisible(el) {
  if (!el || !(el instanceof Element)) return false;
  const s = getComputedStyle(el);
  if (!s || s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity || '1') === 0) return false;
  const r = el.getBoundingClientRect();
  return r.width > 8 && r.height > 8;
}

function findPromptInput() {
  const candidates = Array.from(document.querySelectorAll('[contenteditable="true"], textarea, input'));
  for (const el of candidates) {
    if (isVisible(el)) return el;
  }
  return null;
}

function findReplyContainer() {
  const possible = Array.from(document.querySelectorAll('main, section, div'));
  const scored = possible.map(el => {
    const rect = el.getBoundingClientRect();
    const children = el.children ? el.children.length : 0;
    const score = children * ((window.innerHeight - rect.top) / window.innerHeight);
    return { el, score };
  }).filter(s => s.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.length ? scored[0].el : document.body;
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function setPromptValue(el, prompt) {
  if (!el) return;
  el.focus();

  if (el.isContentEditable) {
    el.innerHTML = '';
    el.innerHTML = prompt;
  } else {
    el.value = '';
    el.value = prompt;
  }

  el.dispatchEvent(new InputEvent('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));

  await delay(100);
}

function userClick(el) {
  const active = document.activeElement;
  const target = active && active.isContentEditable ? active : el;

  target.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    bubbles: true,
    cancelable: true
  }));
  target.dispatchEvent(new KeyboardEvent('keyup', {
    key: 'Enter',
    code: 'Enter',
    bubbles: true,
    cancelable: true
  }));
}

function snapshotReplies(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll('*')).map(n => n.outerHTML);
}

// ---------- Main loop ----------
async function automatePrompts(prompts, delayMs) {
  console.log('Whisk automation started', prompts);
  if (!prompts || !prompts.length) return;

  const input = findPromptInput();
  const replyContainer = findReplyContainer();

  if (!input) {
    alert('Prompt input not found.');
    throw new Error('Input not found');
  }

  for (let i = 0; i < prompts.length; i++) {
    const p = prompts[i];
    console.log(`Submitting (${i + 1}/${prompts.length}):`, p);
    const prev = snapshotReplies(replyContainer);

    await setPromptValue(input, p);
    await delay(200);

    userClick(input);

    try {
      // Instead of fixed, use user-provided delay
      await delay(delayMs);
      console.log('Reply delay complete for prompt', i + 1);
    } catch (err) {
      console.error('No reply detected for prompt', i + 1, err);
      alert(`Stopped: no reply detected for prompt #${i + 1}. See console for details.`);
      throw err;
    }

    await delay(700);
  }

  alert('All prompts processed!');
}
