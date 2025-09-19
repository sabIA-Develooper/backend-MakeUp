import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // ex: 'smtp.gmail.com'
  port: process.env.EMAIL_PORT, // ex: 587
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.EMAIL_USER, // seu email
    pass: process.env.EMAIL_PASS, // sua senha de app
  },
  tls: {
    rejectUnauthorized: false
  }
})

export default transporter
