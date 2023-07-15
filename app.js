const express = require('express');
const authRouter = require('./router/authRoute')
const databaseConnect = require('./confiq/databaseConfiq')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express()

databaseConnect()

app.use(cookieParser())
app.use(express.json())
app.use(cors({
    origin: [process.env.CLIENT_URL],
    credentials: true
}))

app.use(express.urlencoded({extended:false}))


app.use('/api/auth', authRouter) // if anyone use api/auth/* ,then routes it to the given logic like signup 

app.use('/', (req,res) =>{
res.status(200).json({
    data : "JWTAuth server"
})
})


module.exports = app