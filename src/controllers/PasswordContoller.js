import User from '../models/User'
import jwt from 'jsonwebtoken'
import transporter from '../config/emailConfig'

class PasswordController {
  async forgotPassword(req, res) {
    try {
      const { email } = req.body

      if (!email) {
        return res.status(400).json({ errors: ['Email é obrigatório'] })
      }

      const user = await User.findOne({ where: { email } })

      if (!user) {
        return res.status(404).json({ errors: ['Usuário não encontrado'] })
      }

      // Gera JWT para reset de senha (expira em 1 hora)
      const resetToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          type: 'password_reset' // tipo específico para reset
        },
        process.env.TOKEN_SECRET,
        { expiresIn: '1h' }
      )

      // Envia email
      const resetUrl = `${process.env.FRONTEND_URL}/password/resetPassword?token=${resetToken}`
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Recuperação de Senha',
        html: `
        <h2>Recuperação de Senha</h2>
        <p>Você solicitou a recuperação de senha.</p>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetUrl}">Redefinir Senha</a>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou esta recuperação, ignore este email.</p>
        `
      })

      return res.json({ message: 'Email de recuperação enviado com sucesso' })

    } catch (error) {
      console.error('Erro ao enviar email:', error)
      return res.status(500).json({ errors: ['Erro interno do servidor'] })
    }
  }

  async showResetPage(req, res) {
    try {
      const { token } = req.query

      if (!token) {
        return res.status(400).send(`
          <h2>Erro</h2>
          <p>Token não fornecido</p>
        `)
      }

      // Verifica se o token é válido
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET)

      if (decoded.type !== 'password_reset') {
        return res.status(400).send(`
          <h2>Erro</h2>
          <p>Token inválido</p>
        `)
      }

      // Mostra página HTML para redefinir senha
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Redefinir Senha</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input[type="password"] { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
            button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #0056b3; }
            .message { margin-top: 15px; padding: 10px; border-radius: 4px; }
            .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
          </style>
        </head>
        <body>
          <h2>Redefinir Senha</h2>
          <form id="resetForm">
            <div class="form-group">
              <label for="password">Nova Senha:</label>
              <input type="password" id="password" name="password" required minlength="6">
            </div>
            <div class="form-group">
              <label for="confirmPassword">Confirmar Senha:</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required minlength="6">
            </div>
            <button type="submit">Redefinir Senha</button>
          </form>
          <div id="message"></div>

          <script>
            document.getElementById('resetForm').addEventListener('submit', async function(e) {
              e.preventDefault();

              const password = document.getElementById('password').value;
              const confirmPassword = document.getElementById('confirmPassword').value;
              const messageDiv = document.getElementById('message');

              if (password !== confirmPassword) {
                messageDiv.innerHTML = '<div class="error">As senhas não coincidem!</div>';
                return;
              }

              if (password.length < 6) {
                messageDiv.innerHTML = '<div class="error">A senha deve ter pelo menos 6 caracteres!</div>';
                return;
              }

              try {
                const response = await fetch('/password/reset', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    token: '${token}',
                    password: password
                  })
                });

                const result = await response.json();

                if (response.ok) {
                  messageDiv.innerHTML = '<div class="success">Senha redefinida com sucesso!</div>';
                  document.getElementById('resetForm').style.display = 'none';
                } else {
                  messageDiv.innerHTML = '<div class="error">' + (result.errors ? result.errors.join(', ') : 'Erro ao redefinir senha') + '</div>';
                }
              } catch (error) {
                messageDiv.innerHTML = '<div class="error">Erro de conexão. Tente novamente.</div>';
              }
            });
          </script>
        </body>
        </html>
      `)

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).send(`
          <h2>Erro</h2>
          <p>Token expirado. Solicite uma nova recuperação de senha.</p>
        `)
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(400).send(`
          <h2>Erro</h2>
          <p>Token inválido</p>
        `)
      }

      console.error('Erro ao verificar token:', error)
      return res.status(500).send(`
        <h2>Erro</h2>
        <p>Erro interno do servidor</p>
      `)
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, password } = req.body

      if (!token || !password) {
        return res.status(400).json({ errors: ['Token e nova senha são obrigatórios'] })
      }

      // Verifica o JWT
      const decoded = jwt.verify(token, process.env.TOKEN_SECRET)

      // Verifica se é um token de reset de senha
      if (decoded.type !== 'password_reset') {
        return res.status(400).json({ errors: ['Token inválido'] })
      }

      const user = await User.findByPk(decoded.id)

      if (!user) {
        return res.status(400).json({ errors: ['Usuário não encontrado'] })
      }

      // Atualiza a senha
      await user.update({ password }) // será hasheada pelo hook do modelo

      return res.json({ message: 'Senha redefinida com sucesso' })

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({ errors: ['Token expirado'] })
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(400).json({ errors: ['Token inválido'] })
      }

      console.error('Erro ao redefinir senha:', error)
      return res.status(500).json({ errors: ['Erro interno do servidor'] })
    }
  }
}

export default new PasswordController()
