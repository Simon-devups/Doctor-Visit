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
        const topDoctors = await queries.getTopDoctors()
        
        const oldDoctor = await queries.getOldDoctors()
        
        res.render("landing.ejs",{topDoctors:topDoctors,oldDoctors:oldDoctor})
    } catch (err) {
        res.render("FAQ.ejs")
    }
})

//search page
app.get('/search', async (req, res) => {
    try {
        //search section 
        const {workExperience ,spetialty,search,aptmStatus,city} = req.query || ""
        
        const andConditions = [];

        // filter and search section : create conditions with req.query
        if (search && search.trim() !== "") {
        const parts = search.trim().split(/\s+/);
        andConditions.push(
            ...parts.map(p => ({
            OR: [
                { first_name: { contains: p, mode: "insensitive" } },
                { last_name: { contains: p, mode: "insensitive" } },
                { spetialty: { is: { spetialty: { contains: p, mode: "insensitive" } } } },
                { description: { some: { description: { contains: p, mode: "insensitive" } } } },
                { description: { some: { city: { contains: p, mode: "insensitive" } } } },
                { description: { some: { Addres: { contains: p, mode: "insensitive" } } } }
            ]
            }))
        );
        }

        if (spetialty && spetialty.trim()!=="") {
        andConditions.push({
            spetialty: { is: { spetialty: spetialty } }
        });
        }

        if (city && city.trim()!=="") {
            andConditions.push({
                description: { some: { city: city } }
            });
        }

    
        const where = andConditions.length > 0 ? { AND: andConditions } : {};

        //---------------------------------------=>
        const cities = await queries.getCities()

        const Doctors = await queries.getSpecifiedDoctors(where)

        // get spetcialies for filter section 
        const spetialties = await queries.getSpetialties()

        res.render("search.ejs",{doctors:Doctors , spti:spetialties , cities:cities})
    } catch (err) {
        console.log(err)
        res.render("FAQ.html")
    }
})


app.post('/search', async (req, res) => {
    try {
        const {workExperience ,spetialty,search,aptmStatus,city} = req.body || ""

        const queryParams = new URLSearchParams();
        if (search) queryParams.set("search", search);
        if (spetialty) queryParams.set("spetialty", spetialty);
        if (workExperience) queryParams.set("workExperience", workExperience);
        if (city) queryParams.set("city", city);

        res.redirect(`/search?${queryParams.toString()}`);
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
app.get('/flow/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        const specifiedDoctor = await queries.getDoctorById(id)
        res.render("flow.ejs" , {doctor : specifiedDoctor})
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

app.get('/userprofile', (req, res) => {
    try {
        res.render("userprofile.ejs")
    } catch (err) {
        res.render("FAQ.html")
    }
})

app.get('/comment/:id',async(req,res)=>{
    const id = parseInt(req.params.id)
    try{
        res.render('comment.ejs')
    }catch(err){}
})


app.get('/index3', (req, res) => {
    try {
        res.render("index3.ejs")
    } catch (err) {
        res.render("FAQ.html")
    }
})


app.get('/index4', (req, res) => {
    try {
        res.render("index4.ejs")
    } catch (err) {
        res.render("FAQ.html")
    }
})


app.get('/index6', (req, res) => {
    try {
        res.render("index6.ejs")
    } catch (err) {
        res.render("FAQ.html")
    }
})



app.listen(PORT, () => {
    console.log(`running on http://localhost:${PORT}`);
})