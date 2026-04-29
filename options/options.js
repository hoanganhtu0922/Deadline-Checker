document.addEventListener('DOMContentLoaded', () => {
    // Load link cũ lên nếu có
    chrome.storage.local.get(['moodleUrl'], (result) => {
        if (result.moodleUrl) {
            document.getElementById('url-input').value = result.moodleUrl;
        }
    });

    // Lưu link mới
    document.getElementById('save-btn').addEventListener('click', () => {
        const url = document.getElementById('url-input').value.trim();
        if (url) {
            chrome.storage.local.set({ moodleUrl: url }, () => {
                document.getElementById('status').innerText = "✅ Đã lưu thành công!";
                // Yêu cầu background cập nhật dữ liệu ngay lập tức
                chrome.runtime.sendMessage({ action: "fetchNow" });
                setTimeout(() => { document.getElementById('status').innerText = ""; }, 3000);
            });
        }
    });
});