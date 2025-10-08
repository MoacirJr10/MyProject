import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  const { id_token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    const email = payload['email'];
    const name = payload['name'];

    // Verifica se o usuário é o administrador
    const isAdmin = email === process.env.ADMIN_EMAIL;

    // Gera um JWT personalizado
    const token = jwt.sign(
      { userid, email, name, isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expira em 1 hora
    );

    res.status(200).json({ token, isAdmin, name, email });
  } catch (error) {
    console.error('Erro na verificação do token Google:', error);
    res.status(401).json({ error: 'Autenticação falhou' });
  }
});

export default router;
