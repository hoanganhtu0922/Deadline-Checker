const MOODLE_ICAL_URL = "https://courses.ctda.hcmus.edu.vn/calendar/export_execute.php?userid=6532&authtoken=d7e74e90882e52a45a719d762b3f0aeacf2fbcf8&preset_what=all&preset_time=monthnow";

// Thiết lập Alarm để tự động check mỗi 30 phút
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("checkDeadline", { periodInMinutes: 30 });
  fetchAndCheck(); // Chạy lần đầu ngay khi cài
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkDeadline") {
    fetchAndCheck();
  }
});

async function fetchAndCheck() {
  try {
    const response = await fetch(MOODLE_ICAL_URL);
    const data = await response.text();
    
    // Parse đơn giản các sự kiện từ file .ics
    const events = parseICS(data);
    const now = new Date();

    events.forEach(event => {
      const diff = event.start - now;
      const hoursLeft = diff / (1000 * 60 * 60);

      // Nếu deadline còn dưới 24h và chưa quá hạn
      if (hoursLeft > 0 && hoursLeft <= 24) {
        showNotification(event.summary, Math.round(hoursLeft));
      }
    });
  } catch (error) {
    console.error("Lỗi lấy deadline:", error);
  }
}

function parseICS(icsData) {
  const events = [];
  const lines = icsData.split(/\r?\n/);
  let currentEvent = null;

  lines.forEach(line => {
    if (line.startsWith("BEGIN:VEVENT")) currentEvent = {};
    if (line.startsWith("SUMMARY:")) currentEvent.summary = line.substring(8);
    if (line.startsWith("DTSTART:")) {
      // Convert định dạng 20260428T140000Z sang Date object
      const dt = line.substring(8);
      const year = dt.substring(0, 4);
      const month = dt.substring(4, 6) - 1;
      const day = dt.substring(6, 8);
      const hour = dt.substring(9, 11);
      const min = dt.substring(11, 13);
      currentEvent.start = new Date(Date.UTC(year, month, day, hour, min));
    }
    if (line.startsWith("END:VEVENT")) {
      events.push(currentEvent);
      currentEvent = null;
    }
  });
  return events;
}

function showNotification(title, hours) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon/icon128.png",
    title: "⚠️ DEADLINE SẮP ĐẾN!",
    message: `Nội Dung: ${title}\nCòn khoảng ${hours} tiếng nữa là hết hạn!`,
    priority: 2
  });
}

// Lắng nghe yêu cầu cập nhật thủ công từ Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchNow") {
        fetchAndCheck().then(() => sendResponse({status: "done"}));
        return true; // Giữ kết nối cho async
    }
});