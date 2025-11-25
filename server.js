import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg"
import cookieParser from "cookie-parser";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import queries from "./queries.js";

dotenv.config()

const app = express()
const PORT = process.env.PORT;
const sendMassage_API = "https://hamkaransms.com/"


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


// authentication middleware
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});



//home page
app.get('/',async (req, res) => {

    try {
        const allDoctors = await queries.getDoctors()
        
        res.render("landing.ejs",{doctor:allDoctors[0]})
    } catch (err) {
        res.render("FAQ.ejs")
    }
})

//search page
app.get('/search', (req, res) => {
    try {
        res.render("search.ejs")
    } catch (err) {
        res.render("FAQ.html")
    }
})

//login page and signup
app.get('/login', (req, res) => {
    try {
        res.render("login.ejs")
    } catch (err) {
        res.render("FAQ.html")
    }
})

app.get('/code', (req, res) => {
    try {
        // const userPhone =
            res.render("code.ejs")
    } catch (err) {
        res.render("FAQ.html")
    }
})



//choosing doctor
app.get('/flow/:id', (req, res) => {
    const id = parseInt(req.params.id)
    try {
        res.render("flow.ejs")
    } catch (err) {
        res.render("FAQ.html")
    }
})


app.get('/flow2', (req, res) => {
    try {
        res.render("flow2.ejs")
    } catch (err) {
        res.render("FAQ.html")
    }
})


app.get('/flow3', (req, res) => {
    try {
        res.render("flow3.ejs")
    } catch (err) {
        res.render("FAQ.html")
    }
})


app.get('/questions', (req, res) => {
    try {
        res.render("questions.ejs")
    } catch (err) {
        res.render("FAQ.html")
    }
})


app.get('/aboutus', (req, res) => {
    try {
        res.render("aboutus.ejs")
    } catch (err) {
        res.render("FAQ.html")
    }
})



app.listen(PORT, () => {
    console.log(`running on http://localhost:${PORT}`);
})