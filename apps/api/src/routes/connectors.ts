import { Router } from 'express';
import { authenticateToken } from '../auth/middleware';
import { getValidAccessToken } from '../services/tokenVault';
import { publishImportJob } from '../messageBroker/producer';

const router = Router();



router.get('/picker-token', authenticateToken, async (req, res) => {
  const provider = req.query.provider as 'google' | 'microsoft';
  try {
    const token = await getValidAccessToken(req.user.id, provider);
    res.json({ accessToken: token });
  } catch {
    res.status(403).json({ error: 'not_connected' });
  }
});

router.post('/import', authenticateToken, async (req, res) => {
  const { provider, fileId, name, jobId } = req.body;
  const { jobId: queuedJobId, ok } = publishImportJob(provider, fileId, name, req.user.id, jobId);
  if (!ok) return res.status(503).json({ error: 'queue_unavailable' });
  res.json({ jobId: queuedJobId });
});
export default router;
