export default async(req, res, next) => {
  try{
    
    if (!req.userId) {
      return res.status(401).json({ errors: ['Login required'] })
    }

    if (!req.userIsAdmin) {
      return res.status(403).json({ errors: ['Acesso apenas para administradores'] })
    }

    return next()
  } catch(err){
    console.log('Erro na verificação do token:', err.message)
    return res.status(401).json({
      errors: ['Token expirado ou inválido'],
    })
  }
}
