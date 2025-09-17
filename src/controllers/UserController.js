import User from '../models/User'

class UserController{
  async store(req, res) {
    try{

      if('isAdmin' in req.body || 'is_admin' in req.body)
        return res.status(400).json({errors: ['Campo não permitido']})

      const { id, name, email } = await User.create(req.body)

      return res.json({ id, name, email })
    } catch(err){


      return res.status(400).json({errors: err.errors.map(err => err.message)})
    }
  }

  async index(req, res){
    try{
      const users = await User.findAll({ attributes: ['id', 'name', 'email'] })

      return res.json(users)
    } catch(err){
      return res.json(err)
    }
  }

  async show(req, res){
    try{
      const user = await User.findByPk(req.params.id)

      const { id, name, email } = user
      return res.json({ id, name, email })
    } catch(err){
      return res.json(err)
    }
  }

  async update(req, res){
    try{

      const user = await User.findByPk(req.userId)

      if(!user)
        return res.status(400).json({
          errors: ['Usuário não existe.']
      })

      if(!req.userIsAdmin && ('is_admin' in req.body || 'isAdmin' in req.body))
        return res.status(403).json({errors: ['Campo não permitido']})

      const { id, name, email, isAdmin } = await user.update(req.body)

      return res.json({ id, name, email, isAdmin })
    } catch(err){
      return res.status(400).json({errors: err.errors.map(err => err.message)})
    }
  }

    async delete(req, res){
    try{
      const user = await User.findByPk(req.userId)

      if(!user)
        return res.status(400).json({
          errors: ['Usuário não existe.']
      })

      await user.destroy()

      return res.json({deleted: true})
    } catch(err){
      return res.status(400).json({errors: err.errors.map(err => err.message)})
    }
  }
}

export default new UserController()
