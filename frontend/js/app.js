const App = {
    currentId: null,
    currentMarkdown: '',
    currentFilename: '',
    currentPromptOnly: '',

    init() {
        this.bindEvents();
        this.loadSettings();
        document.querySelector('[data-tab="history"]').addEventListener('click', () => {
            HistoryManager.loadHistory();
        });
        if (window.__SHARE_ID) {
            this.loadSharedSpec(window.__SHARE_ID);
        }
    },

    bindEvents() {
        document.getElementById('analyzeBtn').addEventListener('click', () => this.analyze());
        document.getElementById('urlInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.analyze();
        });

        document.getElementById('copyPromptBtn').addEventListener('click', () => this.copyPrompt());
        document.getElementById('shareBtn').addEventListener('click', () => this.share());
        document.getElementById('downloadPdfBtn').addEventListener('click', () => this.downloadPdf());
        document.getElementById('downloadMdBtn').addEventListener('click', () => this.downloadMd());
        document.getElementById('exportHtmlBtn').addEventListener('click', () => this.exportHtml());

        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                UI.switchTab(tab.dataset.tab);
            });
        });

        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('saveApiKeyBtn').addEventListener('click', () => this.saveApiKey());

        document.getElementById('clearHistoryBtn').addEventListener('click', async () => {
            if (confirm('ล้างประวัติทั้งหมด?')) {
                await API.clearHistory();
                UI.showToast('ล้างประวัติเรียบร้อย');
                HistoryManager.loadHistory();
            }
        });
    },

    async analyze() {
        const url = document.getElementById('urlInput').value.trim();
        if (!url) {
            UI.showToast('กรุณาใส่ลิงก์', 'warning');
            return;
        }

        let validUrl;
        try {
            validUrl = new URL(url);
        } catch (_) {
            UI.showToast('ลิงก์ไม่ถูกต้อง', 'error');
            return;
        }

        let apiKey = localStorage.getItem('openrouter_api_key') || '';
        if (apiKey.includes('xxxxxxxx')) apiKey = '';

        const btn = document.getElementById('analyzeBtn');
        const loader = document.getElementById('loader');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังวิเคราะห์...';
        loader.classList.add('active');
        document.getElementById('result').style.display = 'none';

        try {
            const result = await API.analyze(validUrl.href, apiKey);
            this.currentId = result.id;
            this.showResult(result.spec, result.url, result.id);
            UI.showToast('วิเคราะห์สำเร็จ!');
            HistoryManager.loadHistory();
        } catch (error) {
            if (error.message.includes('User not found') || error.message.includes('401')) {
                UI.showToast('API Key ไม่ถูกต้อง ไปที่แท็บ API Key เพื่อตรวจสอบ', 'error');
            } else {
                UI.showToast(error.message, 'error');
            }
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-magnifying-glass"></i> วิเคราะห์';
            loader.classList.remove('active');
        }
    },

    showResult(markdown, url, id) {
        this.currentMarkdown = markdown;
        this.currentFilename = UI.sanitizeFilename(url || 'spec');
        this.currentPromptOnly = this.extractPrompt(markdown);

        document.getElementById('markdownPreview').textContent = markdown;
        document.getElementById('filenameBadge').innerHTML =
            `<i class="far fa-file"></i> ${this.currentFilename}`;

        const shareUrl = API.getShareUrl(id);
        document.getElementById('shareUrlDisplay').textContent = shareUrl;

        document.getElementById('result').style.display = 'block';
        document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    extractPrompt(markdown) {
        const match = markdown.match(/\[COPY FROM HERE\]([\s\S]*?)\[COPY TO HERE\]/);
        if (match) return match[1].trim();

        const cloneSection = markdown.match(/EXACT Clone Prompt.*?\n```text\n([\s\S]*?)```/);
        if (cloneSection) return cloneSection[1].trim();

        const lines = markdown.split('\n');
        let start = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('คุณคือผู้พัฒนาเว็บไซต์มืออาชีพ') || lines[i].includes('senior frontend engineer')) {
                start = i;
                break;
            }
        }
        if (start !== -1) {
            const end = lines.indexOf('```', start);
            return lines.slice(start, end !== -1 ? end : undefined).join('\n').trim();
        }
        return markdown;
    },

    exportHtml() {
        if (!this.currentMarkdown) {
            UI.showToast('ยังไม่มีข้อมูล', 'warning');
            return;
        }
        UI.exportHtml(this.currentMarkdown, this.currentFilename);
        UI.showToast('ดาวน์โหลด HTML เรียบร้อย!');
    },

    async copyPrompt() {
        if (!this.currentPromptOnly) {
            UI.showToast('ยังไม่มีข้อมูล', 'warning');
            return;
        }
        try {
            await UI.copyToClipboard(this.currentPromptOnly);
            UI.showToast('คัดลอก Prompt เรียบร้อย!');
        } catch (_) {
            UI.showToast('ไม่สามารถคัดลอกได้', 'error');
        }
    },

    share() {
        if (!this.currentId) {
            UI.showToast('ยังไม่มีข้อมูล', 'warning');
            return;
        }
        const shareUrl = API.getShareUrl(this.currentId);
        if (navigator.share) {
            navigator.share({
                title: 'Web Spec',
                text: 'ดู Spec และ Prompt สำหรับพัฒนาเว็บไซต์',
                url: shareUrl
            }).catch(() => {});
        } else {
            UI.copyToClipboard(shareUrl).then(() => {
                UI.showToast('คัดลอกลิงก์แชร์แล้ว!');
            }).catch(() => {
                prompt('คัดลอกลิงก์นี้:', shareUrl);
            });
        }
    },

    downloadPdf() {
        if (!this.currentId) {
            UI.showToast('ยังไม่มีข้อมูล', 'warning');
            return;
        }
        const pdfUrl = API.getPdfUrl(this.currentId);
        window.open(pdfUrl, '_blank');
        UI.showToast('กำลังสร้าง PDF...');
    },

    downloadMd() {
        if (!this.currentMarkdown) {
            UI.showToast('ยังไม่มีข้อมูล', 'warning');
            return;
        }
        UI.downloadFile(this.currentMarkdown, this.currentFilename);
        UI.showToast('ดาวน์โหลด .md เรียบร้อย!');
    },

    async loadSharedSpec(id) {
        try {
            const data = await API.getShareData(id);
            this.currentId = data.id;
            this.showResult(data.spec, data.url, data.id);
            UI.showToast('โหลด Spec ที่แชร์แล้ว');
            document.getElementById('shareBtn').style.display = 'none';
        } catch (error) {
            UI.showToast('ไม่พบ Spec ที่แชร์: ' + error.message, 'error');
            document.querySelector('.markdown-body').textContent = 'ไม่พบข้อมูลที่แชร์';
            document.getElementById('result').style.display = 'block';
        }
    },

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const icon = document.getElementById('themeIcon');
        const label = document.getElementById('themeLabel');
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            label.textContent = 'Light';
        } else {
            icon.className = 'fas fa-moon';
            label.textContent = 'Dark';
        }
    },

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', next);
        this.applyTheme(next);
    },

    loadSettings() {
        const key = localStorage.getItem('openrouter_api_key') || '';
        document.getElementById('apiKeyInput').value = key;

        const saved = localStorage.getItem('theme');
        const theme = saved || this.getSystemTheme();
        this.applyTheme(theme);

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    },

    saveApiKey() {
        const key = document.getElementById('apiKeyInput').value.trim();
        if (key) {
            if (key.includes('xxxxxxxx')) {
                UI.showToast('นี่คือ Key ตัวอย่าง กรุณาใส่ Key จริง', 'warning');
                return;
            }
            localStorage.setItem('openrouter_api_key', key);
            UI.showToast('บันทึก API Key เรียบร้อย');
        } else {
            localStorage.removeItem('openrouter_api_key');
            UI.showToast('ลบ API Key แล้ว', 'warning');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
    if (window.__SHARE_ID) {
        App.loadSharedSpec(window.__SHARE_ID);
    }
});
