import dotenv from 'dotenv'
import app from './src/app.js'

dotenv.config()
app.listen({ port: process.env.PORT || 3000 }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
