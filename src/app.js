import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app = express();

// configuring CORS
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
)

app.use(
    express.json({
        limit: '22kb'
    })
)
app.use(
    express.urlencoded({
        extended: true,
        limit: '22kb'
    })
)
app.use(express.static("public"))

// configuring cookie-parser
app.use(cookieParser())

//router import
import userRouter from './routes/user.routes.js';

// routers declaration
app.use('/api/v1/users', userRouter);

export { app } 