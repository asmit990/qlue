import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../auth/middleware';
import { getValidAccessToken } from '../services/tokenVault';
import { saveConnection } from '../services/tokenVault';
import { publishImportJob } from '../messageBroker/producer';
import { googleProvider } from '../auth/provider/google';
import { microsoftProvider } from '../auth/provider/microsoft';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'qlue-super-secret';

type ConnectorProvider = 'google' | 'microsoft';
type ConnectorState = {
  userId: number;
  provider: ConnectorProvider;
  returnTo?: string;
  purpose?: string;
  frontendOrigin?: string;
};

function getProvider(provider: ConnectorProvider) {
  if (provider === 'google') return googleProvider;
  if (provider === 'microsoft') return microsoftProvider;
  throw new Error(`Unsupported provider: ${provider}`);
}

function getFrontendRedirectTarget(pathname = '/ask') {
  const base = process.env.FRONTEND_URL || 'http://localhost:5173';
  return new URL(pathname, base);
}

function getFrontendOriginFromRequest(req: Request) {
  const originHeader = req.headers.origin;
  if (typeof originHeader !== 'string' || originHeader.length === 0) {
    return undefined;
  }

  try {
    const origin = new URL(originHeader);
    if (origin.protocol !== 'http:' && origin.protocol !== 'https:') {
      return undefined;
    }
    return origin.origin;
  } catch {
    return undefined;
  }
}

function appendRedirectParams(url: URL, params: Record<string, string>) {
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

router.get('/auth-url', authenticateToken, async (req, res) => {
  const provider = req.query.provider as ConnectorProvider;
  const returnTo = typeof req.query.returnTo === 'string' ? req.query.returnTo : '/ask';
  const frontendOrigin = getFrontendOriginFromRequest(req);
  if (provider !== 'google' && provider !== 'microsoft') {
    return res.status(400).json({ error: 'invalid_provider' });
  }

  const state = jwt.sign(
    {
      userId: req.user.id,
      provider,
      returnTo,
      purpose: 'connector-auth',
      frontendOrigin,
    },
    JWT_SECRET,
    { expiresIn: '10m' }
  );

  const url = getProvider(provider).getAuthUrl(state);
  res.json({ url });
});

router.get('/picker-token', authenticateToken, async (req, res) => {
  const provider = req.query.provider as ConnectorProvider;
  if (provider !== 'google' && provider !== 'microsoft') {
    return res.status(400).json({ error: 'invalid_provider' });
  }
  try {
    const token = await getValidAccessToken(req.user.id, provider);
    res.json({ accessToken: token });
  } catch {
    res.status(403).json({ error: 'not_connected' });
  }
});

export async function handleConnectorCallback(req: Request, res: Response) {
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const oauthError = typeof req.query.error === 'string' ? req.query.error : '';

  if (!state) {
    return res.status(400).send('Missing OAuth state');
  }

  let decoded: ConnectorState;
  try {
    decoded = jwt.verify(state, JWT_SECRET) as ConnectorState;
  } catch {
    return res.status(400).send('Invalid OAuth state');
  }

  const redirectUrl = decoded.frontendOrigin
    ? new URL(decoded.returnTo || '/ask', decoded.frontendOrigin)
    : getFrontendRedirectTarget(decoded.returnTo || '/ask');

  if (decoded.purpose !== 'connector-auth') {
    return res.redirect(
      appendRedirectParams(redirectUrl, {
        connector: decoded.provider,
        connected: '0',
        error: 'invalid_state',
      })
    );
  }

  if (oauthError) {
    return res.redirect(
      appendRedirectParams(redirectUrl, {
        connector: decoded.provider,
        connected: '0',
        error: oauthError,
      })
    );
  }

  if (!code) {
    return res.redirect(
      appendRedirectParams(redirectUrl, {
        connector: decoded.provider,
        connected: '0',
        error: 'missing_code',
      })
    );
  }

  try {
    const provider = getProvider(decoded.provider);
    const tokens = await provider.exchangeCode(code);
    await saveConnection(decoded.userId, decoded.provider, tokens);

    return res.redirect(
      appendRedirectParams(redirectUrl, {
        connector: decoded.provider,
        connected: '1',
      })
    );
  } catch (error) {
    console.error(`Connector OAuth callback failed for ${decoded.provider}:`, error);
    return res.redirect(
      appendRedirectParams(redirectUrl, {
        connector: decoded.provider,
        connected: '0',
        error: 'oauth_exchange_failed',
      })
    );
  }
}

router.get('/callback', handleConnectorCallback);

router.post('/import', authenticateToken, async (req, res) => {
  const { provider, fileId, name, jobId } = req.body;
  const { jobId: queuedJobId, ok } = publishImportJob(provider, fileId, name, req.user.id, jobId);
  if (!ok) return res.status(503).json({ error: 'queue_unavailable' });
  res.json({ jobId: queuedJobId });
});
export default router;
