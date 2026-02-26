# PromptPilot for Whisk — AI Automation Extension

> A Chrome extension that automates batch prompt submission on [Google Whisk](https://whisk.withgoogle.com/), so you can generate multiple AI images hands-free.

---

## 🚀 What It Does

Instead of manually typing and submitting prompts one by one on Whisk, **PromptPilot** lets you paste a whole list of prompts and runs them automatically — one after another — with a configurable delay between each.

---

## ✨ Features

- **Batch Automation** — Submit multiple prompts sequentially without any manual effort
- **Custom Delay** — Set how many seconds to wait between prompts (default: 7s) to give Whisk time to generate each image
- **Smart Input Detection** — Automatically finds the correct input field on the Whisk page
- **Selector Testing** — Verify the extension can "see" the page before running automation
- **Progress Logging** — Tracks each prompt in the browser console and alerts you when done

---

## 🛠️ Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer Mode** (toggle in the top-right corner)
4. Click **"Load unpacked"**
5. Select the extension folder

The extension icon will appear in your Chrome toolbar.

---

## 📖 How to Use

1. Open [Whisk](https://whisk.withgoogle.com/) in your browser tab
2. Make sure the prompt input area is visible on the page
3. Click the extension icon in the toolbar to open the popup
4. Paste your prompts into the text area — one per line, or as a numbered list:
   ```
   1. A sunset over mountains with golden light
   2. A futuristic city skyline at night
   3. A cat wearing a space suit on the moon
   ```
5. Click **"Start Automation"**
6. Enter your desired delay (in seconds) when prompted — this is how long the extension waits for Whisk to generate each image
7. Sit back — the extension will submit each prompt automatically!

---

## 🧪 Testing the Extension

Before running automation, use the **"Test Selectors"** button to check that the extension can detect the input and reply areas on the Whisk page. It will show a message like:

```
Input FOUND (tag: div)
Reply container FOUND (children: 12)
```

If input is NOT found, make sure the Whisk prompt input area is visible/scrolled into view.

---

## 📁 Project Structure

```
whisk-ai-automation-extension/
├── manifest.json       # Chrome extension config & permissions
├── popup.html          # Extension popup UI
├── popup.js            # Prompt parsing & tab messaging logic
├── content.js          # Core automation engine (runs on Whisk page)
├── icons/              # Extension icons
└── banner.png          # Promotional banner
```

---

## ⚙️ How It Works (Technical)

1. **`popup.js`** parses the textarea input into an array of individual prompts (supports numbered lists and newline-separated text), then sends a `WHISK_AUTOMATE` message to the active tab.
2. **`content.js`** receives the message, asks the user for a delay value, then loops through each prompt:
   - Finds the visible input field using smart DOM heuristics
   - Sets the prompt text and fires `input`/`change` events
   - Simulates pressing **Enter** to submit
   - Waits the specified delay before moving to the next prompt
3. After all prompts are processed, an alert notifies the user.

---

## ⚠️ Notes

- This extension is designed specifically for **[Google Whisk](https://whisk.withgoogle.com/)**
- Make sure the Whisk tab is **active and focused** before starting automation
- Set a delay long enough for Whisk to fully generate each image before the next prompt is submitted (7–15 seconds recommended)
- This is a developer/power-user tool — use responsibly and within Whisk's terms of service

---

## 📄 License

MIT License — free to use, modify, and distribute.
