import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import { resolve } from 'path'

//import homeRoutes from './src/routes/homeRoutes'
import userRoutes from './src/routes/userRoutes'
import tokenRoutes from './src/routes/tokenRoutes'
import passwordRoutes from './src/routes/passwordRoutes'
//import fotoRoutes from './src/routes/fotoRoutes'

import './src/database'

class App {
  constructor() {
    this.app = express()
    this.middlewares()
    this.routes()
  }

  middlewares() {
    this.app.use(express.urlencoded({
      extended: true
    }))
    this.app.use(express.json())
    this.app.use(express.static(resolve(__dirname, 'uploads')))
  }

  routes() {
    const apiRouter = express.Router()

    apiRouter.use('/users/', userRoutes)
    apiRouter.use('/token/', tokenRoutes)
    apiRouter.use('/password/', passwordRoutes)

    this.app.use('/api', apiRouter)
  }
}

export default new App().app
