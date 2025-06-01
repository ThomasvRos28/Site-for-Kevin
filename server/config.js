require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ticket-app',
  jwtSecret: process.env.JWT_SECRET || 'materialflow-secure-jwt-secret-key-2024',
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  emailFrom: process.env.SMTP_FROM,
  uploadDir: 'uploads'
}; 