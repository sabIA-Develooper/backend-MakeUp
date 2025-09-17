import Sequelize, { Model } from 'sequelize'
import bcryptjs from 'bcryptjs'

export default class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
          validate: {
            len: {
              args: [3, 100],
              msg: 'Campo nome dever ter entre 3 e 100 caracteres'
            }
          }
        },

        email: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: {
            msg: 'Email já existe'
          },
          validate: {
            isEmail: {
              msg: 'Email inválido'
            }
          }
        },

        password_hash: {
          type: Sequelize.STRING(255),
          allowNull: false,
          defaultValue: ''
        },

        isAdmin: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          field: 'is_admin'
        },

        password: {
          type: Sequelize.VIRTUAL,
          defaultValue: '',
          validate: {
            len: {
              args: [6, 50],
              msg: 'A senha precisa ter entre 6 e 50 caracteres'
            }
          }
        },

      },
      {
        sequelize
      })

    this.addHook('beforeSave', async user => {
      if (user.password)
        user.password_hash = await bcryptjs.hash(user.password, 8)
    })

    return this
  }

  passwordIsValid(password) {
    return bcryptjs.compare(password, this.password_hash)
  }
}
