import crypto from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { dbClient } from '../../prisma/client.js';

export const oAuthClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/callback'
);

// atualiza o acess token toda vez que muda
oAuthClient.on('tokens', async (newTokens) => {
  if (newTokens.access_token) {
    console.log('🔄 Um novo access token foi gerado automaticamente pelo Google!');

    await dbClient.contas.updateMany({
      where: {
        provedor: 'google',
        refreshToken: oAuthClient.credentials.refresh_token
      },
      data: {
        acessToken: newTokens.access_token,
        tokenExpiry: newTokens.expiry_date ? new Date(newTokens.expiry_date) : undefined
      }
    });
  }
});

// handlers
export async function authHandlers(app) {
  app.get('/get-url', async () => {
    const url = oAuthClient.generateAuthUrl({
      prompt: 'consent',
      access_type: 'offline',
      scope: [
        // auth
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'openid',

        // health
        'https://www.googleapis.com/auth/fitness.activity.read',
        'https://www.googleapis.com/auth/fitness.body.read',
        'https://www.googleapis.com/auth/fitness.blood_glucose.read',
        'https://www.googleapis.com/auth/fitness.blood_pressure.read',
        'https://www.googleapis.com/auth/fitness.heart_rate.read',
        'https://www.googleapis.com/auth/fitness.body_temperature.read',
        'https://www.googleapis.com/auth/fitness.location.read',
        'https://www.googleapis.com/auth/fitness.nutrition.read',
        'https://www.googleapis.com/auth/fitness.sleep.read',
        'https://www.googleapis.com/auth/fitness.oxygen_saturation.read'
      ]
    });

    return { url };
  });

  app.get('/callback', async (req, res) => {
    const code = req.query.code;

    const tokens = await oAuthClient.getToken(code);
    const payload = (
      await oAuthClient.verifyIdToken({
        idToken: tokens.tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
      })
    ).getPayload();

    const contaCriada = await dbClient.contas.upsert({
      where: { provedor_provedorId: { provedor: 'google', provedorId: payload.sub } },
      create: {
        usuario: { create: { nome: payload.name, email: payload.email } },
        provedor: 'google',
        provedorId: payload.sub,
        acessToken: tokens.tokens.access_token,
        refreshToken: tokens.tokens.refresh_token,
        tokenExpiry: new Date(tokens.tokens.expiry_date)
      },
      update: {
        acessToken: tokens.tokens.access_token,
        tokenExpiry: new Date(tokens.tokens.expiry_date),
        ...(tokens.tokens.refresh_token && { refreshToken: tokens.tokens.refresh_token })
      },
      include: { usuario: true }
    });

    // gerar sessao

    // token
    const tokenSessao = crypto.randomBytes(32).toString('hex');

    // tempo de exp
    const seteDiasEmMilissegundos = 7 * 24 * 60 * 60 * 1000;
    const expiraEm = new Date(Date.now() + seteDiasEmMilissegundos);

    // pegar os dados
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    await dbClient.sessoes.create({
      data: {
        id: tokenSessao,
        userAgent,
        ipAddress,
        expiraEm,
        usuarioId: contaCriada.usuarioId
      }
    });

    res.setCookie('session_id', tokenSessao, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 // tempo de vida do cookie
    });

    return res.redirect('http://localhost:3000/welcome');
  });

  app.get('/sign-out', async (req, res) => {
    const sessionId = req.cookies.session_id;

    if (sessionId) {
      // deletar do DB
      dbClient.sessoes.delete({
        where: { id: sessionId }
      });
    }

    // deletar cookie
    res.clearCookie('session_id', { path: '/' });

    return res.redirect('http://localhost:3000/welcome');
  });
}

// middleware de validação
export async function auth(req, res) {
  try {
    const sessionId = req.cookies.session_id;
    if (!sessionId) return res.status(401).send('Usuário não fez o login!');

    const session = await dbClient.sessoes.findFirst({
      where: { id: sessionId },
      include: { usuario: { include: { contas: true } } }
    });

    if (!session || session.expiraEm < new Date()) {
      res.clearCookie('session_id', { path: '/' });
      return res.status(401).send('Sessão expirada ou inexistente!');
    }

    const contaGoogle = session.usuario.contas.find((c) => c.provedor === 'google');
    if (!contaGoogle) {
      return res.status(401).send({ error: 'Usuário não possui conta do Google vinculada!' });
    }

    // cria 1 cliente por request
    const authClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/api/auth/callback'
    );

    authClient.setCredentials({
      access_token: contaGoogle.acessToken,
      refresh_token: contaGoogle.refreshToken,
      expiry_date: contaGoogle.tokenExpiry?.getTime()
    });

    req.healthClient = google.health({
      version: 'v4',
      auth: authClient
    });

    req.oAuthClient = authClient;
    req.accessToken = contaGoogle.acessToken;
  } catch (err) {
    req.log?.error?.(err);
    return res.status(500).send({ error: 'Falha ao autenticar usuário' });
  }
}
