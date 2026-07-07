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
        if (navigator.clipboard?.writeText) {
            return navigator.clipboard.writeText(text).catch(() => this._fallbackCopy(text));
        }
        return this._fallbackCopy(text);
    },

    _fallbackCopy(text) {
        return new Promise((resolve, reject) => {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
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
        const lines = md.split('\n');
        const out = [];
        let inCode = false;
        let inTable = false;
        let inList = false;
        let listType = null;

        function escapeHtml(text) {
            return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        function inlineHtml(text) {
            return escapeHtml(text)
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/`(.+?)`/g, '<code>$1</code>');
        }

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            if (/^```/.test(line)) {
                if (inCode) {
                    out.push('</code></pre>');
                    inCode = false;
                } else {
                    out.push('<pre><code>');
                    inCode = true;
                }
                continue;
            }

            if (inCode) {
                out.push(escapeHtml(line) + '\n');
                continue;
            }

            if (/^\|.+\|$/.test(line.trim())) {
                const cells = line.trim().slice(1, -1).split('|').map(c => c.trim());
                if (cells.every(c => /^[-:\s]+$/.test(c))) {
                    if (inTable) out.push('</thead><tbody>');
                    continue;
                }
                if (!inTable) {
                    out.push('<table><thead><tr>');
                    inTable = true;
                } else if (out[out.length - 1] === '</thead><tbody>') {
                    out.push('<tr>');
                } else {
                    out.push('<tr>');
                }
                const tag = inTable && out.join('').includes('</thead>') ? 'td' : 'th';
                out.push(cells.map(c => `<${tag}>${inlineHtml(c)}</${tag}>`).join('') + '</tr>');
                continue;
            }

            if (inTable) {
                out.push('</tbody></table>');
                inTable = false;
            }

            if (/^#{1,3}\s/.test(line)) {
                if (inList) { out.push(`</${listType}>`); inList = false; listType = null; }
                const level = line.match(/^#+/)[0].length;
                out.push(`<h${level}>${inlineHtml(line.replace(/^#+\s*/, ''))}</h${level}>`);
                continue;
            }

            if (/^---+\s*$/.test(line.trim())) {
                if (inList) { out.push(`</${listType}>`); inList = false; listType = null; }
                out.push('<hr>');
                continue;
            }

            if (/^[-*]\s/.test(line)) {
                if (!inList) { inList = true; listType = 'ul'; out.push('<ul>'); }
                out.push(`<li>${inlineHtml(line.replace(/^[-*]\s*/, ''))}</li>`);
                continue;
            }

            if (/^\d+\.\s/.test(line)) {
                if (!inList) { inList = true; listType = 'ol'; out.push('<ol>'); }
                out.push(`<li>${inlineHtml(line.replace(/^\d+\.\s*/, ''))}</li>`);
                continue;
            }

            if (line.trim() === '') {
                if (inList) { out.push(`</${listType}>`); inList = false; listType = null; }
                continue;
            }

            if (inList) { out.push(`</${listType}>`); inList = false; listType = null; }

            out.push(`<p>${inlineHtml(line)}</p>`);
        }

        if (inCode) out.push('</code></pre>');
        if (inTable) out.push('</tbody></table>');
        if (inList) out.push(`</${listType}>`);

        return out.join('\n');
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
