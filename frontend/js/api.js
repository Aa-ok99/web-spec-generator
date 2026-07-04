const API = {
    baseURL: window.location.origin,

    async analyze(url, apiKey) {
        const response = await fetch(`${this.baseURL}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, apiKey })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Analysis failed');
        }
        return response.json();
    },

    async getHistory() {
        const response = await fetch(`${this.baseURL}/api/history`);
        if (!response.ok) throw new Error('Failed to fetch history');
        return response.json();
    },

    async getHistoryItem(id) {
        const response = await fetch(`${this.baseURL}/api/history/${id}`);
        if (!response.ok) throw new Error('History item not found');
        return response.json();
    },

    async deleteHistoryItem(id) {
        const response = await fetch(`${this.baseURL}/api/history/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    },

    async clearHistory() {
        const response = await fetch(`${this.baseURL}/api/history`, {
            method: 'DELETE'
        });
        return response.json();
    },

    async getShareData(id) {
        const response = await fetch(`${this.baseURL}/api/share/data/${id}`);
        if (!response.ok) throw new Error('Share data not found');
        return response.json();
    },

    getShareUrl(id) {
        return `${window.location.origin}/api/share/${id}`;
    },

    getPdfUrl(id) {
        return `${window.location.origin}/api/share/pdf/${id}`;
    }
};
