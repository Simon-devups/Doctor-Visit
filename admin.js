import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import dotenv from "dotenv";
import pg from "pg"
import queries from "./admin.queris";
import bcrypt from "bcrypt";

dotenv.config()

const app = express()
const PORT = process.env.ADMIN_PORT;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, './frontend')));
app.set('views', path.join(__dirname, './frontend'));
app.use(cors());


const pool = new pg.Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

//cookie and sessions part
const pgSession = connectPgSimple(session);
app.use(cookieParser());
app.use(
    session({
        store: new pgSession({
            pool: pool,
            tableName: "session"
        }),
        secret: "mysecret",         // sessionID
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60, // 60 minutes
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        },
    })
)

function checkLogin(id,res){
    if (!id) res.redirect('/login/admin')
}

// authentication middleware
app.use((req, res, next) => {
    res.locals.doctor = req.session.doctor || null;
    next();
});

app.get('/login/admin',async(req,res)=>{
    try{
        const {name,number,code,password} = req.body;

        if (!name || !number || !code || !password) return res.status(400).json({ message: 'inputs required' });

        const existingAdmin = await queries.findAdmin(name,number,code)
        //check Admin if not exist
        if (!existingAdmin[0]) return res.json({ message: "Admin not exist!" })


        const match = await bcrypt.compare(password, existingAdmin[0].password)
        if (!match) return res.status(400)

        req.session.doctor = {
            id: existingAdmin[0].id,
            name: existingAdmin[0].name,
            code: existingAdmin[0].code
        };

        res.status(200).json({
            data:'با موفقیت وارد شدید',
            redirectUrl:`/admin/${code}`
        })
    }catch(err){
        res.status(500).json({ 
            status: "error", 
            message: "خطایی در ثبت نظر رخ داد" 
        });
    }
})

app.get('/admin/:id')


app.listen(PORT, () => {
    console.log(`admin page running on http://localhost:${PORT}`);
})