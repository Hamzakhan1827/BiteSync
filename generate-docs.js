const fs = require('fs');
const path = require('path');

// Simple markdown to HTML converter (no dependencies)
function mdToHtml(md) {
  return md
    // Headings
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    // Code blocks
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Tables
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.split('|').slice(1, -1).map(c => c.trim());
      return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
    })
    .replace(/^(<tr>.*<\/tr>)$/gm, '$1')
    // Wrap consecutive TRs in table
    .replace(/((<tr>.*<\/tr>\n?)+)/g, (block) => {
      const rows = block.trim().split('\n');
      const header = rows[0].replace(/<td>/g, '<th>').replace(/<\/td>/g, '</th>');
      // Skip separator row (contains ---)
      const bodyRows = rows.slice(2).filter(r => !r.match(/^<tr>(<td>[-: ]+<\/td>)+<\/tr>$/));
      if (bodyRows.length === 0) return `<table><thead>${header}</thead></table>`;
      return `<table><thead>${header}</thead><tbody>${bodyRows.join('\n')}</tbody></table>`;
    })
    // Unordered lists
    .replace(/^(\s*)[-*] (.+)$/gm, '$1<li>$2</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (block) => `<ul>${block}</ul>`)
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs (lines that aren't already HTML)
    .split('\n\n')
    .map(block => {
      block = block.trim();
      if (!block) return '';
      if (block.startsWith('<')) return block;
      return `<p>${block.replace(/\n/g, ' ')}</p>`;
    })
    .join('\n');
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 11pt;
  line-height: 1.75;
  color: #1a1a2e;
  background: #ffffff;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 48px 60px;
}

.doc-header {
  border-top: 6px solid #00A86B;
  padding-top: 32px;
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.brand {
  font-size: 13pt;
  font-weight: 800;
  color: #00A86B;
  letter-spacing: -0.3px;
}

.doc-date {
  font-size: 9pt;
  color: #9ca3af;
}

h1 {
  font-size: 26pt;
  font-weight: 800;
  color: #0b1220;
  letter-spacing: -0.5px;
  border-bottom: 3px solid #00A86B;
  padding-bottom: 14px;
  margin-bottom: 24px;
  margin-top: 0;
}

h2 {
  font-size: 15pt;
  font-weight: 700;
  color: #0b1220;
  margin-top: 40px;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1.5px solid #e8f5f0;
}

h3 {
  font-size: 11pt;
  font-weight: 700;
  color: #00A86B;
  margin-top: 28px;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

h4 {
  font-size: 11pt;
  font-weight: 600;
  color: #374151;
  margin-top: 18px;
  margin-bottom: 8px;
}

blockquote {
  border-left: 4px solid #00A86B;
  margin: 20px 0 28px;
  padding: 14px 20px;
  background: #f0fdf4;
  border-radius: 0 8px 8px 0;
  font-size: 12pt;
  color: #16a34a;
  font-weight: 500;
  font-style: italic;
}

p { margin-bottom: 12px; color: #374151; }

ul, ol { margin: 8px 0 16px 20px; color: #374151; }
li { margin-bottom: 6px; line-height: 1.7; }
li strong { color: #0b1220; }

table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0 28px;
  font-size: 10pt;
  border: 1.5px solid #d1fae5;
  border-radius: 10px;
  overflow: hidden;
}

thead tr { background: #00A86B; }
thead th {
  padding: 11px 14px;
  text-align: left;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.3px;
}

tbody tr:nth-child(even) { background: #f8fffe; }
tbody tr:nth-child(odd) { background: #ffffff; }
tbody td {
  padding: 10px 14px;
  border-bottom: 1px solid #e8f5f0;
  color: #374151;
  vertical-align: top;
}
tbody tr:last-child td { border-bottom: none; }

code {
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 9.5pt;
  background: #f1f5f9;
  padding: 2px 7px;
  border-radius: 4px;
  color: #0f766e;
}

pre {
  background: #0f172a;
  color: #e2e8f0;
  padding: 18px 22px;
  border-radius: 10px;
  margin: 16px 0 24px;
  overflow-x: auto;
  font-size: 9pt;
  line-height: 1.65;
}

pre code { background: none; color: inherit; padding: 0; }

hr { border: none; border-top: 1.5px solid #e8f5f0; margin: 32px 0; }

strong { color: #0b1220; font-weight: 700; }
em { color: #6b7280; }
a { color: #00A86B; text-decoration: none; }

.doc-footer {
  margin-top: 56px;
  padding-top: 16px;
  border-top: 1px solid #e8f5f0;
  font-size: 9pt;
  color: #9ca3af;
  display: flex;
  justify-content: space-between;
}

@media print {
  body { padding: 0; max-width: 100%; }
  h1, h2 { page-break-after: avoid; }
  table, pre, blockquote { page-break-inside: avoid; }
  .doc-header, .doc-footer { display: flex !important; }
  @page { margin: 20mm 22mm; size: A4; }
}
`;

const docs = [
  { file: 'FOR_RESTAURANTS.md', title: 'BiteSync for Restaurants' },
  { file: 'FOR_DINERS.md',      title: 'BiteSync for Diners' },
  { file: 'FAQ.md',             title: 'BiteSync FAQ' },
  { file: 'PRIVACY_POLICY.md',  title: 'BiteSync Privacy Policy' },
  { file: 'ARCHITECTURE.md',    title: 'BiteSync Architecture' },
  { file: 'DATABASE.md',        title: 'BiteSync Database Reference' },
  { file: 'DEVELOPMENT.md',     title: 'BiteSync Development Guide' },
  { file: 'DEPLOYMENT.md',      title: 'BiteSync Deployment Guide' },
  { file: 'SECURITY.md',        title: 'BiteSync Security Model' },
];

const docsDir = path.join(__dirname, 'docs');
const outDir  = path.join(__dirname, 'docs', 'pdf');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const now = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

docs.forEach(({ file, title }) => {
  const mdPath = path.join(docsDir, file);
  if (!fs.existsSync(mdPath)) return;

  const md = fs.readFileSync(mdPath, 'utf8');
  const body = mdToHtml(md);

  const htmlOut = file.replace('.md', '.html');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="doc-header">
    <div class="brand">⬡ BiteSync</div>
    <div class="doc-date">${now}</div>
  </div>
  ${body}
  <div class="doc-footer">
    <span>BiteSync — Confidential</span>
    <span>${title}</span>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(outDir, htmlOut), html, 'utf8');
  console.log(`✅ Generated: docs/pdf/${htmlOut}`);
});

console.log('\n📄 Open any file in Chrome and press Ctrl+P → Save as PDF → A4 → Save');
