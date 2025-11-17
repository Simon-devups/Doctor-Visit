import express from "express";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { render } from "ejs";


dotenv.config()

const app = express()
const PORT = process.env.PORT;




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, './frontend')));
app.set('views', path.join(__dirname, './frontend'));
app.use(cors());


//home page
app.get('/', (req, res) => {
    try{
        res.render("landing.ejs")
        // res.render("landing.ejs")
    }catch(err){
        res.render("FAQ.ejs")
    }
})

//search page
app.get('/search', (req, res) => {
    try{
        res.render("search.ejs")
    }catch(err){
        res.render("FAQ.html")
    }
})

//login page and signup
app.get('/login', (req, res) => {
    try{
        res.render("login.ejs")
    }catch(err){
        res.render("FAQ.html")
    }
})


//choosing doctor
app.get('/flow', (req, res) => {
    try{
        res.render("flow.ejs")
    }catch(err){
        res.render("FAQ.html")
    }
})


app.get('/flow2', (req, res) => {
    try{
        res.render("flow2.ejs")
    }catch(err){
        res.render("FAQ.html")
    }
})


app.get('/flow3', (req, res) => {
    try{
        res.render("flow3.ejs")
    }catch(err){
        res.render("FAQ.html")
    }
})


app.get('/code', (req, res) => {
    try{
        res.render("code.ejs")
    }catch(err){
        res.render("FAQ.html")
    }
})



app.get('/questions', (req, res) => {
    try{
        res.render("questions.ejs")
    }catch(err){
        res.render("FAQ.html")
    }
})


app.get('/aboutus', (req, res) => {
    try{
        res.render("aboutus.ejs")
    }catch(err){
        res.render("FAQ.html")
    }
})



app.listen(PORT , () => {
    console.log(`running on http://localhost:${PORT}`);
})