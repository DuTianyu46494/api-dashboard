import { Router, Response } from 'express';
import { queryAll, queryOne, run } from '../models/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// 获取所有告警
router.get('/', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const alerts = queryAll(
      'SELECT * FROM alerts WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.userId]
    );

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: '获取告警失败' });
  }
});

// 获取未读告警数量
router.get('/unread-count', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const result = queryOne(
      'SELECT COUNT(*) as count FROM alerts WHERE user_id = ? AND is_read = 0',
      [req.userId]
    ) as any;

    res.json({ count: result.count });
  } catch (error) {
    res.status(500).json({ error: '获取未读数量失败' });
  }
});

// 标记告警为已读
router.put('/:id/read', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    run('UPDATE alerts SET is_read = 1 WHERE id = ? AND user_id = ?', [id, req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '更新告警失败' });
  }
});

// 标记所有告警为已读
router.put('/read-all', authenticate, (req: AuthRequest, res: Response) => {
  try {
    run('UPDATE alerts SET is_read = 1 WHERE user_id = ?', [req.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '更新告警失败' });
  }
});

// 检查预算告警（定时任务调用）
router.post('/check-budget', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // 获取所有配置的预算使用情况
    const configs = queryAll(`
      SELECT
        c.provider,
        c.budget,
        COALESCE(SUM(u.cost), 0) as spent
      FROM api_configs c
      LEFT JOIN usage_records u ON c.provider = u.provider AND c.user_id = u.user_id
      WHERE c.user_id = ?
      GROUP BY c.provider
    `, [userId]) as any[];

    const alerts: any[] = [];

    configs.forEach(config => {
      const usagePercent = (config.spent / config.budget) * 100;

      if (usagePercent >= 90) {
        const message = `${config.provider} 预算使用已达 ${usagePercent.toFixed(1)}%，请注意控制用量`;

        // 检查是否已存在类似告警
        const existingAlert = queryOne(
          `SELECT id FROM alerts WHERE user_id = ? AND provider = ? AND message = ? AND created_at > datetime('now', '-1 hour')`,
          [userId, config.provider, message]
        );

        if (!existingAlert) {
          run('INSERT INTO alerts (user_id, provider, message) VALUES (?, ?, ?)',
            [userId, config.provider, message]);
          alerts.push({ provider: config.provider, message });
        }
      }
    });

    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ error: '检查预算失败' });
  }
});

export default router;
