document.addEventListener('DOMContentLoaded', () => {
    renderList();
    document.getElementById('refresh-btn').addEventListener('click', () => {
        const btn = document.getElementById('refresh-btn');
        btn.innerText = "Đang tải...";
        chrome.runtime.sendMessage({ action: "fetchNow" }, () => {
            setTimeout(() => {
                renderList();
                btn.innerText = "Cập nhật ngay";
            }, 1000);
        });
    });
});

function renderList() {
    const container = document.getElementById('deadline-list');
    chrome.storage.local.get(['deadlineList', 'doneIds'], (data) => {
        const list = data.deadlineList || [];
        const doneIds = data.doneIds || [];

        if (list.length === 0) {
            container.innerHTML = '<p style="text-align:center">Trống trơn!</p>';
            return;
        }

        container.innerHTML = '';
        list.forEach(item => {
            // KHÔNG CẦN generateId nữa, dùng luôn item.id
            const isDone = doneIds.includes(item.id);

            const itemDiv = document.createElement('div');
            itemDiv.className = `deadline-item ${isDone ? 'completed' : ''}`;
            itemDiv.innerHTML = `
                <input type="checkbox" class="checkbox-input" ${isDone ? 'checked' : ''}>
                <div>
                    <span class="name">${item.summary}</span>
                    <span class="time">⏰ ${new Date(item.start).toLocaleString('vi-VN')}</span>
                </div>
            `;

            const cb = itemDiv.querySelector('.checkbox-input');
            cb.addEventListener('change', () => {
                handleCheck(item.id, cb.checked);
                itemDiv.classList.toggle('completed', cb.checked);
            });
            container.appendChild(itemDiv);
        });
    });
}

function handleCheck(id, status) {
    chrome.storage.local.get(['doneIds'], (data) => {
        let doneIds = data.doneIds || [];
        if (status) {
            if (!doneIds.includes(id)) doneIds.push(id);
        } else {
            doneIds = doneIds.filter(i => i !== id);
        }
        chrome.storage.local.set({ doneIds: doneIds });
    });
}