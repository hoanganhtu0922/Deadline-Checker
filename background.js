const MOODLE_ICAL_URL = "https://courses.ctda.hcmus.edu.vn/calendar/export_execute.php?userid=6532&authtoken=d7e74e90882e52a45a719d762b3f0aeacf2fbcf8&preset_what=all&preset_time=monthnow";

chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create("checkDeadline", { periodInMinutes: 30 });
    fetchAndCheck();
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "checkDeadline") fetchAndCheck();
});

async function fetchAndCheck() {
    try {
        const response = await fetch(MOODLE_ICAL_URL);
        const data = await response.text();
        const events = parseICS(data);
        const now = new Date();

        const sortedEvents = events
            .filter(event => event.start > now)
            .sort((a, b) => a.start - b.start);

        chrome.storage.local.set({ deadlineList: sortedEvents });

        chrome.storage.local.get(['doneIds'], (result) => {
            const doneIds = result.doneIds || [];
            sortedEvents.forEach(event => {
                const diff = event.start - now;
                const hoursLeft = diff / (1000 * 60 * 60);

                // Dùng event.id (chính là UID từ Moodle)
                if (hoursLeft > 0 && hoursLeft <= 24 && !doneIds.includes(event.id)) {
                    showNotification(event.id, event.summary, Math.round(hoursLeft));
                }
            });
        });
    } catch (error) { console.error("Lỗi:", error); }
}

function parseICS(icsData) {
    const events = [];
    const blocks = icsData.split("BEGIN:VEVENT");
    blocks.shift();

    blocks.forEach(block => {
        const summaryMatch = block.match(/SUMMARY:(.*)/);
        const dtstartMatch = block.match(/DTSTART:(.*)/);
        const uidMatch = block.match(/UID:(.*)/); // Lấy ID duy nhất từ Moodle
        
        if (summaryMatch && dtstartMatch && uidMatch) {
            const dt = dtstartMatch[1].trim();
            const year = dt.substring(0, 4);
            const month = dt.substring(4, 6) - 1;
            const day = dt.substring(6, 8);
            const hour = dt.substring(9, 11);
            const min = dt.substring(11, 13);
            
            events.push({
                id: uidMatch[1].trim(), // Lưu UID vào đây
                summary: summaryMatch[1].trim(),
                start: new Date(Date.UTC(year, month, day, hour, min))
            });
        }
    });
    return events;
}

function showNotification(id, title, hours) {
    chrome.notifications.create(id, {
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: "⚠️ DEADLINE CẬN KỀ!",
        message: `Môn: ${title}\nCòn ${hours} tiếng!`,
        priority: 2
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchNow") {
        fetchAndCheck().then(() => sendResponse({status: "done"}));
        return true;
    }
});