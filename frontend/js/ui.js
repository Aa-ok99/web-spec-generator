const UI = {
    toastTimer: null,

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toastMessage');
        const icon = toast.querySelector('i');

        toastMsg.textContent = message;
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-triangle-exclamation'
        };
        icon.className = icons[type] || 'fas fa-info-circle';
        toast.dataset.type = type;

        toast.classList.add('show');
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    },

    sanitizeFilename(url) {
        try {
            const u = new URL(url);
            let host = u.hostname.replace(/^www\./, '').replace(/\./g, '-');
            host = host.replace(/[^a-z0-9-]/gi, '');
            return host + '-spec.md';
        } catch (_) {
            return 'website-spec.md';
        }
    },

    formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    copyToClipboard(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise((resolve, reject) => {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                resolve();
            } catch (e) {
                reject(e);
            }
            document.body.removeChild(ta);
        });
    },

    downloadFile(content, filename, mimeType = 'text/markdown') {
        const blob = new Blob([content], { type: mimeType + ';charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    },

    switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
        document.querySelector(`.tab[data-tab="${tabId}"]`)?.classList.add('active');
        document.getElementById(`tab-${tabId}`)?.classList.add('active');
    }
};
