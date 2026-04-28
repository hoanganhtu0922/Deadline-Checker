document.addEventListener('DOMContentLoaded', function() {
    displayDeadlines();

    // Nút refresh dữ liệu từ Moodle
    document.getElementById('refresh-btn').addEventListener('click', () => {
        const btn = document.getElementById('refresh-btn');
        btn.innerText = "Đang cập nhật...";
        chrome.runtime.sendMessage({ action: "fetchNow" }, (response) => {
            setTimeout(() => {
                displayDeadlines();
                btn.innerText = "Cập nhật ngay";
            }, 1000);
        });
    });
});

function displayDeadlines() {
    // Lấy cả danh sách deadline và danh sách các bài đã tick "done"
    chrome.storage.local.get(['deadlineList', 'doneIds'], (result) => {
        const listDiv = document.getElementById('deadline-list');
        const deadlines = result.deadlineList || [];
        const doneIds = result.doneIds || []; // Mảng chứa ID các bài đã làm

        if (deadlines.length === 0) {
            listDiv.innerHTML = "<p>Hiện không có deadline nào.</p>";
            return;
        }

        listDiv.innerHTML = deadlines.map(item => {
            // Tạo ID duy nhất cho mỗi bài dựa trên tên và thời gian (vì Moodle iCal đôi khi ko có ID riêng)
            const itemId = btoa(item.summary + item.start); 
            const isDone = doneIds.includes(itemId);

            return `
                <div class="deadline-item ${isDone ? 'done' : ''}" data-id="${itemId}">
                    <div class="checkbox-container">
                        <input type="checkbox" class="done-checkbox" ${isDone ? 'checked' : ''}>
                    </div>
                    <div class="info-container">
                        <span class="name">${item.summary}</span>
                        <span class="time">Hạn: <span class="urgent">${new Date(item.start).toLocaleString('vi-VN')}</span></span>
                    </div>
                </div>
            `;
        }).join('');

        // Thêm sự kiện click cho các checkbox
        const checkboxes = document.querySelectorAll('.done-checkbox');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', (e) => {
                const parent = e.target.closest('.deadline-item');
                const id = parent.getAttribute('data-id');
                toggleDone(id, e.target.checked);
                parent.classList.toggle('done', e.target.checked);
            });
        });
    });
}

function toggleDone(id, isChecked) {
    chrome.storage.local.get(['doneIds'], (result) => {
        let doneIds = result.doneIds || [];
        if (isChecked) {
            if (!doneIds.includes(id)) doneIds.push(id);
        } else {
            doneIds = doneIds.filter(item => item !== id);
        }
        chrome.storage.local.set({ doneIds: doneIds });
    });
}