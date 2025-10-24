const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const winston = require('winston');
const multer = require('multer');

const app = express();

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

process.on('uncaughtException', (err) => {
  logger.error('未捕获的异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
});

app.use(helmet({
  contentSecurityPolicy: false,
  frameguard: false
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const publicDir = path.resolve(__dirname, '../frontend/public');
const distDir = path.resolve(__dirname, '../frontend/dist');
const publicPath = fs.existsSync(publicDir) ? publicDir : distDir;
app.use(express.static(publicPath));

const uploadDir = path.join(publicPath, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const dbPath = path.join(__dirname, 'achievements.db');
const db = new sqlite3.Database(dbPath);

function initDatabase() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT (datetime('now', '+8 hours'))
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      achievement_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT (datetime('now', '+8 hours')),
      FOREIGN KEY (achievement_id) REFERENCES achievements(id)
    )`);
  });
}

initDatabase();

app.post('/api/achievements', upload.single('image'), (req, res) => {
  const { title, description } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : '';

  if (!title) {
    return res.status(400).json({ error: '标题不能为空' });
  }

  db.run(
    'INSERT INTO achievements (title, description, image_url) VALUES (?, ?, ?)',
    [title, description, image_url],
    function(err) {
      if (err) return res.status(500).json({ error: '添加成就失败' });
      res.json({ id: this.lastID, title, description, image_url, likes: 0 });
    }
  );
});

app.get('/api/achievements', (req, res) => {
  db.all('SELECT * FROM achievements ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: '获取成就列表失败' });
    res.json(rows);
  });
});

app.get('/api/achievements/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM achievements WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: '获取成就详情失败' });
    if (!row) return res.status(404).json({ error: '成就不存在' });
    res.json(row);
  });
});

app.post('/api/achievements/:id/like', (req, res) => {
  const { id } = req.params;
  db.run('UPDATE achievements SET likes = likes + 1 WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: '点赞失败' });
    if (this.changes === 0) return res.status(404).json({ error: '成就不存在' });
    db.get('SELECT likes FROM achievements WHERE id = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ error: '获取点赞数失败' });
      res.json({ likes: row.likes });
    });
  });
});

app.post('/api/achievements/:id/comment', (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: '评论内容不能为空' });
  }

  db.run(
    'INSERT INTO comments (achievement_id, content) VALUES (?, ?)',
    [id, content],
    function(err) {
      if (err) return res.status(500).json({ error: '添加评论失败' });
      res.json({ id: this.lastID, achievement_id: id, content });
    }
  );
});

app.get('/api/achievements/:id/comments', (req, res) => {
  const { id } = req.params;
  db.all(
    'SELECT * FROM comments WHERE achievement_id = ? ORDER BY created_at DESC',
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: '获取评论失败' });
      res.json(rows);
    }
  );
});

app.get('*', (req, res) => {
  const filePath = path.join(publicPath, req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.sendFile(filePath);
  } else {
    res.sendFile(path.join(publicPath, 'index.html'));
  }
});

app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});