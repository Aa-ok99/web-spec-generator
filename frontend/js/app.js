const App = {
    currentId: null,
    currentMarkdown: '',
    currentFilename: '',
    currentPromptOnly: '',
    generatedCode: null,
    generatedId: null,

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

        document.getElementById('generateAppBtn').addEventListener('click', () => this.generateApp());
        document.getElementById('promptGenerateBtn').addEventListener('click', () => this.promptGenerate());
        document.getElementById('downloadZipBtn').addEventListener('click', () => this.downloadZip());
        document.getElementById('copyCodeBtn').addEventListener('click', () => this.copyCode());
        document.getElementById('closePreviewBtn').addEventListener('click', () => this.closePreview());

        const promptInput = document.getElementById('promptInput');
        promptInput.addEventListener('input', () => this.autoResize(promptInput));
        promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) this.promptGenerate();
        });

        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('promptInput').value = btn.dataset.prompt;
                this.autoResize(document.getElementById('promptInput'));
            });
        });

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

    autoResize(el) {
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
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
        document.getElementById('previewSection').style.display = 'none';

        try {
            const result = await API.analyze(validUrl.href, apiKey);
            this.currentId = result.id;
            this.generatedCode = null;
            this.generatedId = null;
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

        document.getElementById('markdownPreview').innerHTML = UI.markdownToHtml(markdown);
        document.getElementById('filenameBadge').innerHTML =
            `<i class="far fa-file"></i> ${this.currentFilename}`;

        const shareUrl = API.getShareUrl(id);
        document.getElementById('shareUrlDisplay').textContent = shareUrl;

        document.getElementById('result').style.display = 'block';
        document.getElementById('previewSection').style.display = 'none';
        document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    async generateApp() {
        if (!this.currentId) {
            UI.showToast('กรุณาวิเคราะห์ URL ก่อน', 'warning');
            return;
        }

        let apiKey = localStorage.getItem('openrouter_api_key') || '';
        if (apiKey.includes('xxxxxxxx')) apiKey = '';

        const btn = document.getElementById('generateAppBtn');
        const genLoader = document.getElementById('genLoader');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังสร้าง...';
        genLoader.classList.add('active');

        try {
            const result = await API.generateCode(this.currentId, apiKey);
            this.generatedCode = result.code;
            this.generatedId = result.id;

            document.getElementById('codeContent').textContent = result.code;
            document.getElementById('previewIframe').srcdoc = result.previewHtml;
            document.getElementById('previewTitle').textContent = 'แอปพลิเคชันที่สร้างจาก Spec';

            document.getElementById('previewSection').style.display = 'block';
            document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth', block: 'start' });

            if (result.cached) {
                UI.showToast('โหลดจากแคชสำเร็จ!');
            } else {
                UI.showToast('สร้างแอปสำเร็จ!');
            }
        } catch (error) {
            UI.showToast(error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-rocket"></i> สร้าง React App';
            genLoader.classList.remove('active');
        }
    },

    async promptGenerate() {
        const prompt = document.getElementById('promptInput').value.trim();
        if (!prompt) {
            UI.showToast('กรุณาใส่ prompt', 'warning');
            return;
        }

        let apiKey = localStorage.getItem('openrouter_api_key') || '';
        if (apiKey.includes('xxxxxxxx')) apiKey = '';

        const btn = document.getElementById('promptGenerateBtn');
        const loader = document.getElementById('promptLoader');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังสร้าง...';
        loader.classList.add('active');

        try {
            const result = await API.generateFromPrompt(prompt, apiKey);
            this.generatedCode = result.code;
            this.generatedId = result.id;
            this.currentId = result.id;

            document.getElementById('codeContent').textContent = result.code;
            document.getElementById('previewIframe').srcdoc = result.previewHtml;
            document.getElementById('previewTitle').textContent = 'Prompt → App';

            document.getElementById('previewSection').style.display = 'block';
            document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth', block: 'start' });

            UI.showToast('สร้างแอปสำเร็จ!');
            HistoryManager.loadHistory();
        } catch (error) {
            UI.showToast(error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> สร้าง App';
            loader.classList.remove('active');
        }
    },

    downloadZip() {
        if (!this.currentId) {
            UI.showToast('ยังไม่มีข้อมูล', 'warning');
            return;
        }
        const url = API.getDownloadUrl(this.currentId);
        window.open(url, '_blank');
        UI.showToast('กำลังดาวน์โหลด ZIP...');
    },

    async copyCode() {
        if (!this.generatedCode) {
            UI.showToast('ยังไม่มีโค้ด', 'warning');
            return;
        }
        try {
            await UI.copyToClipboard(this.generatedCode);
            UI.showToast('คัดลอกโค้ดแล้ว!');
        } catch (_) {
            UI.showToast('ไม่สามารถคัดลอกได้', 'error');
        }
    },

    closePreview() {
        document.getElementById('previewSection').style.display = 'none';
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) {
            document.getElementById(`tab-${activeTab.dataset.tab}`)?.scrollIntoView({ behavior: 'smooth' });
        }
    },

    extractPrompt(markdown) {
        const match = markdown.match(/\[COPY FROM HERE\]([\s\S]*?)\[COPY TO HERE\]/);
        if (match) return match[1].trim();

        const cloneSection = markdown.match(/EXACT Clone Prompt[\s\S]*?\n```\w*\n([\s\S]*?)```/);
        if (cloneSection) return cloneSection[1].trim();

        const lines = markdown.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('คุณคือผู้พัฒนาเว็บไซต์มืออาชีพ') || lines[i].includes('senior frontend engineer')) {
                for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].trim() === '```') {
                        return lines.slice(i, j).join('\n').trim();
                    }
                }
                return lines.slice(i).join('\n').trim();
            }
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
