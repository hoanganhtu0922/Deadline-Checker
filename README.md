# Moodle Deadline Extension

A lightweight Chrome Extension designed for students to track Moodle deadlines in real-time. This tool fetches your personalized deadline schedule from Moodle and provides a convenient checklist to manage your tasks.

## Features

- **Automatic Sync:** Fetches deadlines directly from your Moodle iCal link.
- **Real-time Notifications:** Alerts you when a deadline is approaching (within 24 hours).
- **Interactive Checklist:** Tick off completed tasks to keep your list organized.
- **Global Alerts:** Displays a reminder box even when you are browsing other sites like Google.

## Installation Instructions (Local Development)

Since this extension is in development, you need to load it manually into Google Chrome:

### 1. Download the Project
- Clone this repository: `git clone https://github.com/your-username/MoodleDeadlineExtension.git`
- Or download the ZIP file from GitHub and extract it to a folder on your computer.

### 2. Load the Extension into Chrome
1. Open Google Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** by toggling the switch in the top right corner.
3. Click the **Load unpacked** button.
4. Select the folder where you saved this project.

## Project Structure 

```text
├── manifest.json       # Extension configuration
├── background.js       # Background service worker (data fetching)
├── popup/
│   ├── popup.html      # UI for the extension popup
│   └── popup.js        # Logic for the checklist and UI updates
├── scripts/
│   ├── ical.min.js     # Library to parse .ics data
│   └── content.js      # Script to inject alerts into websites
└── icons/              # Extension icons
