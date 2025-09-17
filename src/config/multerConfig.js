import multer from 'multer'
import { extname, resolve } from 'path'

const aleatorio = () => Math.floor(Math.random() * 10000 + 10000)

export default {
  fileFilter: (req, file, cb) => {
    console.log('Tipo de arquivo recebido:', file.mimetype)
    if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg') {
      console.log('Tipo de arquivo rejeitado:', file.mimetype)
      return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Arquivo precisa ser PNG ou JPG'))
    }
    cb(null, true)
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, resolve(__dirname, '..', '..', 'uploads', 'images'))
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${aleatorio()}${extname(file.originalname)}`)
    }
  })
}
