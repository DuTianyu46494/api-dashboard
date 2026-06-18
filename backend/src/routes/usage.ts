import { Router, Response } from 'express';
import { queryAll, queryOne, run } from '../models/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// 获取使用量统计
router.get('/stats', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // 总统计
    const totalStats = queryOne(`
      SELECT
        COALESCE(SUM(cost), 0) as totalCost,
        COALESCE(SUM(requests), 0) as totalRequests,
        COALESCE(SUM(tokens), 0) as totalTokens
      FROM usage_records WHERE user_id = ?
    `, [userId]);

    // 按提供商统计
    const providerStats = queryAll(`
      SELECT
        provider,
        COALESCE(SUM(cost), 0) as cost,
        COALESCE(SUM(requests), 0) as requests,
        COALESCE(SUM(tokens), 0) as tokens
      FROM usage_records WHERE user_id = ?
      GROUP BY provider
    `, [userId]);

    // 获取预算配置
    const budgets = queryAll('SELECT provider, budget FROM api_configs WHERE user_id = ?', [userId]) as any[];
    const budgetMap = budgets.reduce((acc: any, b: any) => {
      acc[b.provider] = b.budget;
      return acc;
    }, {});

    // 计算提供商详情
    const providerDetails = providerStats.map((stat: any) => ({
      ...stat,
      budget: budgetMap[stat.provider] || 100,
      usagePercent: budgetMap[stat.provider]
        ? Math.min((stat.cost / budgetMap[stat.provider]) * 100, 100)
        : 0
    }));

    res.json({
      total: totalStats,
      providers: providerDetails
    });
  } catch (error) {
    res.status(500).json({ error: '获取统计失败' });
  }
});

// 获取模型使用详情
router.get('/models', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    const modelStats = queryAll(`
      SELECT
        model,
        provider,
        COALESCE(SUM(requests), 0) as requests,
        COALESCE(SUM(tokens), 0) as tokens,
        COALESCE(SUM(cost), 0) as cost,
        COALESCE(AVG(latency), 0) as avgLatency
      FROM usage_records WHERE user_id = ?
      GROUP BY model, provider
      ORDER BY requests DESC
    `, [userId]);

    res.json(modelStats);
  } catch (error) {
    res.status(500).json({ error: '获取模型统计失败' });
  }
});

// 获取历史趋势
router.get('/history', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const days = parseInt(req.query.days as string) || 7;

    const history = queryAll(`
      SELECT
        DATE(recorded_at) as date,
        COALESCE(SUM(cost), 0) as cost,
        COALESCE(SUM(requests), 0) as requests,
        COALESCE(SUM(tokens), 0) as tokens
      FROM usage_records WHERE user_id = ?
        AND recorded_at >= DATE('now', '-' || ? || ' days')
      GROUP BY DATE(recorded_at)
      ORDER BY date ASC
    `, [userId, days]);

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: '获取历史数据失败' });
  }
});

// 记录使用量（供外部调用）
router.post('/record', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { provider, model, requests, tokens, cost, latency } = req.body;
    const userId = req.userId;

    run(`
      INSERT INTO usage_records (user_id, provider, model, requests, tokens, cost, latency)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [userId, provider, model, requests || 0, tokens || 0, cost || 0, latency || 0]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: '记录使用量失败' });
  }
});

export default router;
