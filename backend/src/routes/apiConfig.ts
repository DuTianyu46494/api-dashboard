import { Router, Response } from 'express';
import CryptoJS from 'crypto-js';
import { queryAll, queryOne, run } from '../models/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'dashboard-encryption-key';

// 获取所有API配置
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const configs = queryAll('SELECT * FROM api_configs WHERE user_id = ?', [req.userId]);
    const decryptedConfigs = configs.map((config: any) => ({
      ...config,
      api_key: decryptApiKey(config.api_key)
    }));
    res.json(decryptedConfigs);
  } catch (error) {
    res.status(500).json({ error: '获取配置失败' });
  }
});

// 添加API配置
router.post('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { provider, api_key, endpoint, budget, note } = req.body;

    if (!provider || !api_key) {
      return res.status(400).json({ error: '提供商和API Key不能为空' });
    }

    const encryptedKey = encryptApiKey(api_key);
    const result = run(
      'INSERT INTO api_configs (user_id, provider, api_key, endpoint, budget, note) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userId, provider, encryptedKey, endpoint || null, budget || 100, note || null]
    );

    res.json({ id: result.lastInsertRowid, provider, api_key, endpoint, budget, note });
  } catch (error) {
    res.status(500).json({ error: '添加配置失败' });
  }
});

// 更新API配置
router.put('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { provider, api_key, endpoint, budget, note } = req.body;

    const existingConfig = queryOne('SELECT * FROM api_configs WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!existingConfig) {
      return res.status(404).json({ error: '配置不存在' });
    }

    const encryptedKey = api_key ? encryptApiKey(api_key) : (existingConfig as any).api_key;
    run(
      'UPDATE api_configs SET provider = ?, api_key = ?, endpoint = ?, budget = ?, note = ? WHERE id = ? AND user_id = ?',
      [provider, encryptedKey, endpoint, budget, note, id, req.userId]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '更新配置失败' });
  }
});

// 删除API配置
router.delete('/:id', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = run('DELETE FROM api_configs WHERE id = ? AND user_id = ?', [id, req.userId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: '配置不存在' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '删除配置失败' });
  }
});

// 加密API Key
function encryptApiKey(apiKey: string): string {
  return CryptoJS.AES.encrypt(apiKey, ENCRYPTION_KEY).toString();
}

// 解密API Key
function decryptApiKey(encryptedKey: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export default router;
