import express from 'express';
import  mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';

dotenv.config();

const app = express();

mongoose.connect(`${process.env.MONGODB_START}${process.env.MONGODB_END}`, {}, () => {
    console.log('Connected to mongoose successfuly');
});

// Middlewares 
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(session({
    secret: "secretcode",
    resave: true,
    saveUninitialized: true
}));
app.use(cookieParser('secretcode'));
app.use(passport.initialize());
app.use(passport.session());



app.get('/', (req, res) => {
    res.send('Hello World');
});

app.listen(4000, () => {
    console.log("Server Started");
});