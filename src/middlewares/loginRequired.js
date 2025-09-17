import jwt from 'jsonwebtoken'
import User from '../models/User'

export default async(req, res, next) => {
  const { authorization } = req.headers

  console.log('Header authorization:', authorization)

  if(!authorization)
    return res.status(401).json({
      errors: ['Login required'],
    })

  const parts = authorization.split(' ')

  if(parts.length !== 2) {
    console.log('Formato de authorization inválido:', authorization)
    return res.status(401).json({
      errors: ['Formato de token inválido'],
    })
  }

  const [scheme, token] = parts

  if(scheme !== 'Bearer') {
    console.log('Scheme inválido:', scheme)
    return res.status(401).json({
      errors: ['Token deve começar com Bearer'],
    })
  }

  try{
    const dados = jwt.verify(token, process.env.TOKEN_SECRET)
    const { id, email, isAdmin } = dados

    console.log('Token decodificado:', { id, email })

    const user = await User.findOne({
      where: {
        id,
        email
      }
    })

    if(!user) {
      console.log('Usuário não encontrado:', { id, email })
      return res.status(401).json({
        errors: ['Usuário inválido'],
      })
    }

    req.userId = id
    req.userEmail = email
    req.userIsAdmin = isAdmin

    return next()

  } catch(err){
    console.log('Erro na verificação do token:', err.message)
    return res.status(401).json({
      errors: ['Token expirado ou inválido'],
    })
  }
}
