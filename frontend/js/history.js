const HistoryManager = {
    async loadHistory() {
        try {
            const data = await API.getHistory();
            this.render(data);
            return data;
        } catch (error) {
            UI.showToast('ไม่สามารถโหลดประวัติได้: ' + error.message, 'error');
            return [];
        }
    },

    render(history) {
        const container = document.getElementById('historyList');
        const badge = document.getElementById('historyBadge');

        if (!history || history.length === 0) {
            container.innerHTML = `
                <p style="color:var(--text-muted); text-align:center; padding:40px 0;">
                    <i class="fas fa-inbox" style="font-size:32px; display:block; margin-bottom:12px;"></i>
                    ยังไม่มีประวัติ
                </p>
            `;
            badge.textContent = '0';
            return;
        }

        badge.textContent = history.length;

        container.innerHTML = history.map(item => `
            <div class="history-item" data-id="${item.id}">
                <div class="info">
                    <div class="title">${this.escapeHtml(item.title || 'ไม่ระบุชื่อ')}</div>
                    <div class="url">${this.escapeHtml(item.url)}</div>
                    <div class="date">${UI.formatDate(item.createdAt)}</div>
                </div>
                <div class="actions">
                    <button class="btn btn-outline btn-sm load-history-btn" data-id="${item.id}">
                        <i class="fas fa-eye"></i> ดู
                    </button>
                    <button class="btn btn-danger btn-sm delete-history-btn" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.load-history-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                HistoryManager.loadAndShow(id);
            });
        });

        container.querySelectorAll('.delete-history-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (confirm('ลบรายการนี้?')) {
                    await API.deleteHistoryItem(id);
                    UI.showToast('ลบเรียบร้อย');
                    HistoryManager.loadHistory();
                }
            });
        });

        container.querySelectorAll('.history-item').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.id;
                HistoryManager.loadAndShow(id);
            });
        });
    },

    async loadAndShow(id) {
        try {
            const item = await API.getHistoryItem(id);
            UI.switchTab('analyze');
            App.showResult(item.spec, item.url, id);
            UI.showToast('โหลดประวัติสำเร็จ');
        } catch (error) {
            UI.showToast('ไม่พบข้อมูล: ' + error.message, 'error');
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
