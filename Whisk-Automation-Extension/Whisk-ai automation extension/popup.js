// popup.js
document.getElementById('startBtn').addEventListener('click', startAutomation);
document.getElementById('testBtn').addEventListener('click', testSelectors);

function parsePrompts(raw) {
  if (!raw) return [];
  const lines = raw.split(/\r?\n/);
  const isNumbered = lines.some(l => /^\s*\d+[\.\)]\s*/.test(l));
  const out = [];
  if (isNumbered) {
    let current = '';
    for (const line of lines) {
      if (/^\s*$/.test(line)) continue;
      const m = line.match(/^\s*\d+[\.\)]\s*(.*)$/);
      if (m) {
        if (current) out.push(current.trim());
        current = m[1].trim();
      } else {
        current += (current ? ' ' : '') + line.trim();
      }
    }
    if (current) out.push(current.trim());
  } else {
    const blocks = raw.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
    if (blocks.length > 1) out.push(...blocks);
    else out.push(...raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean));
  }
  return out.map(p => p.replace(/^\s*[\-•]*\s*\d+[\.\)\-:]*\s*/, '').replace(/^['"“”‘’]+|['"“”‘’]+$/g, '').trim());
}

async function startAutomation() {
  const raw = document.getElementById('promptList').value;
  const prompts = parsePrompts(raw);
  if (!prompts.length) return alert('Paste at least one prompt.');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return alert('No active tab.');

  chrome.tabs.sendMessage(tab.id, { type: 'WHISK_AUTOMATE', prompts }, (resp) => {
    if (chrome.runtime.lastError) {
      alert('Could not contact tab. Make sure Whisk is open in the active tab.');
      console.error(chrome.runtime.lastError);
      return;
    }
    console.log('content response:', resp);
  });

  window.close();
}

async function testSelectors() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return alert('No active tab.');

  chrome.tabs.sendMessage(tab.id, { type: 'WHISK_TEST_SELECTORS' }, (resp) => {
    if (chrome.runtime.lastError) {
      alert('Could not contact tab. Make sure Whisk is open in the active tab.');
      console.error(chrome.runtime.lastError);
      return;
    }
    alert(resp && resp.message ? resp.message : 'No response.');
  });
}
