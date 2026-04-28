// Kiểm tra dữ liệu từ storage và chèn thông báo vào trang web
chrome.storage.local.get(['deadlineList'], (result) => {
    const deadlines = result.deadlineList || [];
    if (deadlines.length > 0) {
        const firstDeadline = deadlines[0]; // Lấy cái gần nhất
        
        // Tạo một thẻ div thông báo đơn giản
        const alertBox = document.createElement('div');
        alertBox.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 9999;
            background: #ffeb3b; padding: 15px; border: 2px solid #f44336;
            border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            font-family: sans-serif; cursor: pointer;
        `;
        alertBox.innerHTML = `<strong>⚠️ Nhắc nợ bài tập:</strong><br>${firstDeadline.summary}`;
        
        alertBox.onclick = () => alertBox.remove(); // Click để tắt
        document.body.appendChild(alertBox);
    }
});