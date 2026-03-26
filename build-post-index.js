/**
 * Netlify build script
 * _posts/ klasöründeki tüm .md dosyalarını okur,
 * front matter'ı parse eder ve _posts/index.json üretir.
 * Her Netlify deploy'unda otomatik çalışır.
 */
const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '_posts');
const outputFile = path.join(postsDir, 'index.json');

function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return {};
  const fm = {};
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    fm[key] = val;
  });
  return fm;
}

function calcReadingTime(content) {
  const withoutFM = content.replace(/^---[\s\S]*?---\n?/, '');
  const words = withoutFM.replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

const posts = files.map(filename => {
  const content = fs.readFileSync(path.join(postsDir, filename), 'utf-8');
  const fm = parseFrontMatter(content);
  return {
    file: filename,
    title: fm.title || filename,
    date: fm.date || '',
    category: fm.category || '',
    thumbnail: fm.thumbnail || '',
    excerpt: fm.excerpt || '',
    readingTime: calcReadingTime(content)
  };
});

posts.sort((a, b) => {
  if (!a.date && !b.date) return 0;
  if (!a.date) return 1;
  if (!b.date) return -1;
  return new Date(b.date) - new Date(a.date);
});

fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2), 'utf-8');
console.log('_posts/index.json guncellendi: ' + posts.length + ' yazi');
