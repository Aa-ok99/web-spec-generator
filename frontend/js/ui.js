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
    },

    markdownToHtml(md) {
        let html = md
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/^- (.+)$/gm, '<li>$1</li>')
            .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
            .replace(/^\|(.+)\|$/gm, (m) => {
                const cells = m.slice(1, -1).split('|').map(c => c.trim());
                if (cells.every(c => /^[-:\s]+$/.test(c))) return '';
                return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
            })
            .replace(/\n{2,}/g, '</p><p>')
            .replace(/\n/g, '<br>');

        html = '<p>' + html + '</p>';
        html = html.replace(/<li><br>/g, '<li>');
        html = html.replace(/<br><\/li>/g, '</li>');
        html = html.replace(/(<li>.*?<\/li>)/gs, (m) => {
            if ((m.match(/<li>/g) || []).length > 1) return m;
            return '<ul>' + m + '</ul>';
        });
        html = html.replace(/<ul><ul>/g, '<ul>');
        html = html.replace(/<\/ul><\/ul>/g, '</ul>');
        html = html.replace(/<tr>.*?<\/tr>/gs, (m) => '<table>' + m + '</table>');
        html = html.replace(/<table><table>/g, '<table>');
        html = html.replace(/<\/table><\/table>/g, '</table>');

        return html;
    },

    exportHtml(markdown, filename) {
        const bodyHtml = this.markdownToHtml(markdown);
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const fullHtml = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${filename}</title>
<style>
body { font-family: 'Inter', -apple-system, sans-serif; background: ${isDark ? '#0b1426' : '#f6f8fc'}; color: ${isDark ? '#eef2f8' : '#0b1a33'}; padding: 32px; line-height: 1.7; max-width: 900px; margin: 0 auto; }
h1 { font-size: 26px; border-bottom: 2px solid ${isDark ? '#2a3a55' : '#e2e8f0'}; padding-bottom: 8px; margin-top: 32px; }
h2 { font-size: 20px; margin-top: 28px; color: ${isDark ? '#b0c4de' : '#2563eb'}; }
h3 { font-size: 16px; margin-top: 20px; }
code { background: ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}; padding: 2px 8px; border-radius: 6px; font-size: 13px; color: ${isDark ? '#7aa9ff' : '#2563eb'}; }
table { width: 100%; border-collapse: collapse; margin: 16px 0; }
td, th { border: 1px solid ${isDark ? '#2a3a55' : '#e2e8f0'}; padding: 10px 14px; text-align: left; font-size: 14px; }
th { background: ${isDark ? '#1e2a41' : '#f1f4f9'}; font-weight: 600; }
li { margin: 4px 0; }
p { margin: 12px 0; }
strong { color: ${isDark ? '#eef2f8' : '#0b1a33'}; }
</style>
</head>
<body>${bodyHtml}</body>
</html>`;
        this.downloadFile(fullHtml, filename.replace(/\.md$/, '.html'), 'text/html');
    }
};
