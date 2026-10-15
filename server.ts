import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Helper to execute Python backend engine
function runPythonEngine(action: string, inputData?: any, arg?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const args = ['backend/cli.py', action];
    if (arg) args.push(arg);

    const py = spawn('python3', args, {
      cwd: process.cwd(),
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
    });

    let stdout = '';
    let stderr = '';

    if (inputData) {
      py.stdin.write(JSON.stringify(inputData));
      py.stdin.end();
    }

    py.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    py.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    py.on('close', (code) => {
      if (code !== 0) {
        try {
          const parsed = JSON.parse(stdout);
          if (parsed && parsed.error) {
            return reject(new Error(parsed.error));
          }
        } catch (_) {}
        console.error(`Python engine exited with code ${code}: ${stderr}`);
        return reject(new Error(stderr || `Python engine process exited with code ${code}`));
      }

      try {
        const firstBracket = stdout.search(/[{\[]/);
        if (firstBracket === -1) {
          throw new Error('No valid JSON found in stdout: ' + stdout);
        }
        const closingChar = stdout[firstBracket] === '{' ? '}' : ']';
        const lastBracket = stdout.lastIndexOf(closingChar);
        const jsonStr = stdout.slice(firstBracket, lastBracket !== -1 ? lastBracket + 1 : undefined);
        const parsed = JSON.parse(jsonStr);
        resolve(parsed);
      } catch (err) {
        console.error('Failed to parse Python stdout JSON:', stdout);
        reject(err);
      }
    });
  });
}

// 1. Health check
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const data = await runPythonEngine('health');
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Video analysis
app.post('/api/analyse/video', async (req: Request, res: Response) => {
  const url = req.body?.url || '';
  const isDemo = req.body?.demo_mode === true || url.includes('sarah.botanicals') || url.includes('mkbhd');
  const dataset = req.body?.sample_dataset === 'tech' ? 'tech' : 'lifestyle';

  try {
    const result = await runPythonEngine('analyse_video', req.body);
    if (result.error) {
      return res.status(400).json({ detail: result.error });
    }
    return res.json(result);
  } catch (err: any) {
    console.warn('[Server] Python execution warning:', err.message);
    // ONLY fall back to precomputed sample data if this was a sample dataset request!
    if (isDemo) {
      const precomputedFile = path.resolve(process.cwd(), `backend/data/precomputed_${dataset}.json`);
      if (fs.existsSync(precomputedFile)) {
        try {
          const fallbackData = JSON.parse(fs.readFileSync(precomputedFile, 'utf-8'));
          return res.json(fallbackData);
        } catch (parseErr) {
          console.error('Failed reading precomputed dataset file:', parseErr);
        }
      }
    }
    return res.status(400).json({
      detail: err.message || 'Failed to retrieve real comments from the provided TikTok video URL.'
    });
  }
});

// 3. CSV analysis
app.post('/api/analyse/csv', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: 'No CSV file provided' });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const lines = fileContent.split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (lines.length < 2) {
      return res.status(400).json({ detail: 'CSV file is empty or missing headers' });
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const commentsData: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Regex CSV splitter matching quotes
      const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] ? values[idx].replace(/^"|"$/g, '').trim() : '';
      });

      const text = row.comment_text || row.comment || row.text || row.content || '';
      if (text) {
        commentsData.push({
          comment_id: row.comment_id || row.id || `c_${i}`,
          author: row.author || row.username || `user_${i}`,
          comment_text: text,
          likes: parseInt(row.likes || '0', 10) || 0,
          timestamp: row.timestamp || new Date().toISOString(),
        });
      }
    }

    if (commentsData.length === 0) {
      return res.status(400).json({ detail: 'No valid comment text found in uploaded CSV' });
    }

    const payload = {
      video_id: req.body.video_id || 'uploaded_video',
      caption: req.body.caption || 'Uploaded TikTok Video Comments',
      author: req.body.author || 'creator',
      comments_data: commentsData,
    };

    const result = await runPythonEngine('analyse_csv', payload);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ detail: err.message || 'Failed to process CSV in Python' });
  }
});

// 4. Analysis history
app.get('/api/analysis/history', async (_req: Request, res: Response) => {
  try {
    const history = await runPythonEngine('history');
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get analysis by ID
app.get('/api/analysis/:id', async (req: Request, res: Response) => {
  try {
    const result = await runPythonEngine('get_analysis', undefined, req.params.id);
    if (!result || result.error) {
      return res.status(404).json({ detail: 'Analysis not found' });
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ detail: err.message });
  }
});

// 6. Export analysis to CSV
app.get('/api/analysis/:id/export', async (req: Request, res: Response) => {
  try {
    const report = await runPythonEngine('get_analysis', undefined, req.params.id);
    if (!report || report.error) {
      return res.status(404).send('Analysis not found');
    }

    const rows = [
      [
        'Comment ID',
        'Author',
        'Comment Text',
        'Likes',
        'Timestamp',
        'VADER Sentiment',
        'VADER Compound',
        'VADER Pos',
        'VADER Neg',
        'VADER Neu',
        'HF Sentiment',
        'HF Confidence',
        'Detected Emotion',
        'Emojis',
        'Disagreement',
      ].join(','),
    ];

    for (const c of report.comments || []) {
      const v = c.vader || {};
      const h = c.huggingface || {};
      const e = c.emotion || {};
      const textClean = `"${(c.text || '').replace(/"/g, '""')}"`;
      rows.push(
        [
          c.id,
          c.author,
          textClean,
          c.likes || 0,
          c.timestamp || '',
          v.sentiment || '',
          v.compound || 0,
          v.pos || 0,
          v.neg || 0,
          v.neu || 0,
          h.label || '',
          h.confidence || 0,
          e.top_emotion || '',
          `"${(c.emojis || []).join(' ')}"`,
          c.has_disagreement ? 'YES' : 'NO',
        ].join(',')
      );
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=auralens_${req.params.id}.csv`
    );
    res.send(rows.join('\n'));
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// Main server bootstrap
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] AuraLens Platform running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Startup error:', err);
});
