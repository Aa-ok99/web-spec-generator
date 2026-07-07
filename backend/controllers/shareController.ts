const historyService = require('../services/historyService');
const { jsPDF } = require('jspdf');

async function getShareData(req, res) {
  try {
    const item = await historyService.getById(req.params.id);
    res.json(item);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.message });
  }
}

async function generatePDF(req, res) {
  try {
    const item = await historyService.getById(req.params.id);

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    doc.setFontSize(18);
    doc.text(`Web Spec: ${item.title || 'Unknown'}`, margin, 25);

    doc.setFontSize(10);
    doc.text(`URL: ${item.url}`, margin, 35);
    doc.text(`Date: ${new Date(item.createdAt).toLocaleString('th-TH')}`, margin, 42);

    doc.setFontSize(9);
    const lines = doc.splitTextToSize(item.spec, maxWidth);
    let y = 52;
    for (const line of lines) {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 4.5;
    }

    const pdfBuffer = doc.output('arraybuffer');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${item.title || 'spec'}-${item.id}.pdf"`);
    res.send(Buffer.from(pdfBuffer));

  } catch (error) {
    const status = error.statusCode || 500;
    console.error('PDF Error:', error);
    res.status(status).json({ error: 'PDF generation failed: ' + error.message });
  }
}

function getShareView(req, res) {
  const { id } = req.params;
  if (!id || typeof id !== 'string' || id.length > 20) {
    return res.status(400).send('Invalid ID');
  }
  const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Shared Web Spec</title>
      <script>
        window.__SHARE_ID = '${id}';
      </script>
      <link rel="stylesheet" href="/css/style.css" />
    </head>
    <body>
      <div class="container">
        <header class="app-header">
          <h1><i class="fas fa-code"></i> Web Spec Generator <span class="badge">Shared</span></h1>
        </header>
        <div class="card" id="result" style="display:block;">
          <div class="result-header">
            <h2><i class="fas fa-check-circle" style="color:var(--success);"></i> Shared Spec</h2>
            <div class="result-actions">
              <button class="btn btn-success btn-sm" id="downloadPdfBtn">
                <i class="fas fa-file-pdf"></i> PDF
              </button>
              <button class="btn btn-success btn-sm" id="downloadMdBtn">
                <i class="fas fa-download"></i> .md
              </button>
            </div>
          </div>
          <div class="markdown-body" id="markdownPreview">Loading...</div>
        </div>
      </div>
      <script src="/js/ui.js"></script>
      <script src="/js/api.js"></script>
      <script src="/js/app.js"></script>
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          if (window.__SHARE_ID) {
            loadSharedSpec(window.__SHARE_ID);
          }
        });
        function loadSharedSpec(id) {
          fetch('/api/share/data/' + id)
            .then(res => res.json())
            .then(data => {
              document.getElementById('markdownPreview').innerHTML = (typeof UI !== 'undefined' && UI.markdownToHtml) ? UI.markdownToHtml(data.spec) : data.spec;
              document.getElementById('downloadPdfBtn').onclick = () => {
                window.open('/api/share/pdf/' + id, '_blank');
              };
              document.getElementById('downloadMdBtn').onclick = () => {
                const blob = new Blob([data.spec], { type: 'text/markdown;charset=utf-8' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = data.title + '-spec.md';
                link.click();
              };
            })
            .catch(err => {
              document.getElementById('markdownPreview').textContent = 'Error: ' + err.message;
            });
        }
      </script>
    </body>
    </html>
  `;
  res.send(html);
}

module.exports = {
  getShareData,
  generatePDF,
  getShareView
};
