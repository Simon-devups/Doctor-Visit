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
import upload from "./multer.js";
// import EnglishToPersian from "./middlewares/EnglishTopersian.js";
import internetCheck from './middlewares/internetCheck.js';
import { create } from "domain";
import { userInfo } from "os";
import { stringify } from "querystring";

dotenv.config()

const app = express()
const PORT = process.env.PORT;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, './frontend')));
app.set('views', path.join(__dirname, './frontend'));
app.use(cors());
// app.use(internetCheck)


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

function toPersianDigits(str) {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.toString().replace(/\d/g, x => farsiDigits[x]);
}




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
        const {workExperience ,spetialty,search,aptmStatus,city,gender} = req.query || ""
        
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
            // city = city.split(',')
            andConditions.push({
                description: { some: { city: city } }
            });
        }
        if (gender && gender.trim()!=="") {
            andConditions.push({
                description: { some: { gender: gender } }
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
        res.render("FAQ.ejs")
    }
})


app.post('/search', async (req, res) => {
    try {
        const {workExperience ,spetialty,search,aptmStatus,city,gender} = req.body || ""

        const queryParams = new URLSearchParams();
        if (search) queryParams.set("search", search);
        if (spetialty) queryParams.set("spetialty", spetialty);
        if (workExperience) queryParams.set("workExperience", workExperience);
        if (city) queryParams.set("city", city);
        if (gender) queryParams.set("gender", gender);

        res.redirect(`/search?${queryParams.toString()}`);
    } catch (err) {
        res.render("FAQ.ejs")
    }
})

//login page and signup
app.get('/login_signUp', (req, res) => {
    try {
        res.render("login.ejs")
    } catch (err) {
        res.render("FAQ.ejs")
    }
})


app.get('/signUp_page',(req,res)=>{
    res.render('signUp.ejs')
})


app.post('/signUp', upload.single("avatar") , async(req,res) => {
    try{
        let filename = "empty.png"
        if(req.file.filename) filename = req.file.filename
        
        const user = req.body
        const signUpUser = await queries.signUpUser(user,filename)
        res.redirect('/login_signUp')
    }catch(err){
        console.log(err)
        res.render("FAQ.ejs")
    }
})

app.post('/login',async(req,res)=>{
    try {
        const userCode = req.body.code1 + req.body.code2 + req.body.code3 + req.body.code4 + req.body.code5

        //initialiez code that will send to user phone
        const user = await queries.findUser(req.session.phone)
        const CODE = '12345';

        if(userCode !== CODE) {res.json({message:'code is wrong'})}
        else{
            req.session.user = {
                id:user.id,
                first_name:user.firt_name,
                last_name:user.last_name,
                phone:user.phone,
                avatar:user.avatar_url,
            }

            res.redirect('/')
        }
        
    } catch (err) {
        console.log(req.session.user)
        console.log(err)
        res.render("FAQ.ejs")
    }
})

app.post('/login/code',async (req, res) => {
    try {
        const userPhone = req.body.phoneNumber
        req.session.phone = userPhone

        const user = await queries.findUser(userPhone)
        if(!user) return res.json({ message: "User not exist! please sign up." })
        res.render('code.ejs')
    } catch (err) {
        res.render("FAQ.ejs")
    }
})

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({
        message: 'Logout failed',
        status: 'error'
      })
    }

    res.clearCookie('connect.sid')
    return res.redirect('/')
  })
})

app.get('/profile', async(req, res) => {
    try {
        if (req.session.user){
            const User = await queries.findUserById(req.session.user.id)
            const cities = await queries.getCities()
            console.log(User)
            res.render("userprofile.ejs",{User:User , cities:cities})
        }else{
            res.redirect("/login_signUp")
        }
    } catch (err) {
        console.log(err)
        res.render("FAQ.ejs")
    }
})

app.post('/profile/update',async(req,res)=>{
    try{
        // const {lastName,firstName,birthYear,nationalCode,city,gender,email,mobile} = req.body;
        const updatedInfo = req.body;
        // const filename = req.file.filename?yes:no;
        // console.log(filename)

        const updateUser = await queries.updateUser(req.session.user.id,updatedInfo)
        res.redirect('/profile')
    }catch(err){
        console.log(err)
        res.render("FAQ.ejs")
    }
})

app.post('/profile/updatePhoto',async(req,res)=>{
    try{
        const updatedPhoto = req.file.filename
        const updateUser = await queries.updateUser(req.session.user,updatedPhoto)
        res.redirect('/profile')
    }catch(err){
        res.render("FAQ.ejs")
    }
})


//choosing doctor
app.get('/flow/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        const contact = await queries.getDoctorContacts(id)
        const specifiedDoctor = await queries.getDoctorById(id)
        
        //comment section
        const doctorComments = await queries.getDoctorComments(id)

        let sum = 0;
        doctorComments.forEach(comment=>{
            const persianDate = new Intl.DateTimeFormat('fa-IR', {
                dateStyle: 'long'}).format(comment.date);
            comment.date = persianDate
            
            if(comment.suggest == 'true') sum+=1
        })

        //doctor rating
        const doctorRecommend = parseInt((sum/(doctorComments.length))*100)

        //result example : [0,1,2,3,4]
        const workingDaysInWeek = await queries.getDoctorWorkingDays(id)  // 0:saturday  ,  1:sonday  ,  ...
        

        res.render("flow.ejs" , {doctor : specifiedDoctor , contact:contact , comments:doctorComments , doctorRecommend:doctorRecommend})
    } catch (err) {
        console.log(err)
        res.render("FAQ.ejs")
    }
})

app.get('/calender/:id/checkDay',async(req,res)=>{
    const doctorId = parseInt(req.params.id);
    try{
        const date = new Date(req.query.date);
        //request example : {date:'2026-02-11'}
        const emptyTimes = await queries.getDoctorEmptyTimes(doctorId,date)
        // response example : [
        //{ start: '09:00', isAvailable: true },{ start: '09:30', isAvailable: true },{ start: '10:00', isAvailable: true },...
        //]


        res.status(200).json({ 
            data:emptyTimes,
            status: "success",
            redirectUrl: `/flow/${doctorId}` 
        });
    }catch(err){
        console.log(err)
        res.status(500).json({ 
            status: "error", 
            message: "خطا در برقراری ارتباط" 
        });
    }
})

app.get("/reserveDoctor/:id",async(req,res)=>{
    const doctorId = parseInt(req.params.id);
    try{

        if (!req.session.user) {
            return res.status(401).json({ message: "لطفاً ابتدا وارد حساب خود شوید" });
        }


        const time = '12:00';
        const userId = req.session.user.id;
        const date = new Date(`2026-01-01T${time}:00`)

        const reserveAppoitment = await queries.addAppointmentToPendingList(doctorId,userId,date);

        res.status(200).json({ 
            data:reserveAppoitment,
            status: "success",
            redirectUrl: `/flow2/${doctorId}` 
        });
    }catch(err){}
        res.status(500).json({ 
            status: "error", 
            message: "خطا در برقراری ارتباط" 
        });
})

app.get('/reservedAppoitment/pay/:id',async(req,res)=>{
    const doctorId = parseInt(req.params.id);
    try{

        if (!req.session.user) {
            return res.status(401).json({ message: "لطفاً ابتدا وارد حساب خود شوید" });
        }

        const userId = req.session.user.id;
        
        const reserveAppoitment = await queries.addAppointmentToConfirmedList(doctorId,userId,)
    }catch(err){
        res.status(500).json({ 
            status: "error", 
            message: "خطا در برقراری ارتباط" 
        });
    }
})


app.get('/flow2/:id', async(req, res) => {
    const id = parseInt(req.params.id)
    try {
        const specifiedDoctor = await queries.getDoctorById(id)

        const date = '2026-01-05T10:30:00Z' //date will be fill when callendar finished

        const user = req.session.user
        const appointment = await queries.addAppointmentToPendingList(id,user.id,date)

        res.render("flow2.ejs",{doctor:specifiedDoctor})
    } catch (err) {
        res.render("FAQ.ejs")
    }
})


app.get('/flow3/:id',async (req, res) => {
    const id = parseInt(req.params.id)
    try {
        //price section
        const doctorPrice =parseInt( await queries.getDoctorPrice(id))
        const commission = 20000
        const prices = {
            commission:commission,
            doctorPrice:doctorPrice,
            finallPrice:doctorPrice+commission
        }

        //doctor information
        const specifiedDoctor = await queries.getDoctorById(id)

        res.render("flow3.ejs",{prices:prices , doctor:specifiedDoctor})
    } catch (err) {
        res.render("FAQ.ejs")
    }
})


app.get('/ConfirmAppointment/:id',async(req,res)=>{
    const id = parseInt(req.params.id)
    try{
        const user = req.session.user
        const appointment = await queries.addAppointmentToConfirmedList(id,user.id)
        res.redirect('/')
    }catch(err){
        console.log(err)
        res.render("FAQ.ejs")
    }
})

//reserve list section
app.get('/reserveList',async(req,res)=>{
    try{
        const user = req.session.user
        const ConfirmedreserveList = await queries.getConfermedUserAppointments(user.id)
        // const DonereserveList = await queries.getDoneUserAppointments(user.id)
        // const PendingList = await queries.getPendingUserAppointments(user.id)

        res.render('list-main.ejs',{list:ConfirmedreserveList})
    }catch(err){
        console.log(err)
        res.render("FAQ.ejs")
    }
})

app.post('/reserveList/deletereserve/:id',async(req,res)=>{
    const id = parseInt(req.params.id)
    try{
        const deleteAppointment = await queries.deleteAppointment(id)
        res.redirect('/reserveList')
    }catch(err){
        console.log(err)
        res.render("FAQ.ejs")
    }
})

app.get('/Doctor/:id',async(req,res)=>{
    const id = parseInt(req.params.id)
    try{
        const specifiedDoctor = await queries.getDoctorById(id)
        res.render('list-DoctorProfile.ejs',{doctor:specifiedDoctor})
    }catch(err){
        res.render("FAQ.ejs")
    }
    
})


app.get('/questions', (req, res) => {
    try {
        res.render("questions.ejs")
    } catch (err) {
        res.render("FAQ.ejs")
    }
})


app.get('/aboutus', (req, res) => {
    try {
        res.render("aboutus.ejs")
    } catch (err) {
        res.render("FAQ.ejs")
    }
})

app.get('/userprofile', (req, res) => {
    try {
        res.render("userprofile.ejs")
    } catch (err) {
        res.render("FAQ.ejs")
    }
})

// comment section : send comment to the doctor
app.get('/comment/:id',async(req,res)=>{
    const id = parseInt(req.params.id)
    try{
        const userId = req.session.user.id
        const specifiedDoctor = await queries.getDoctorById(id)
        res.render('comment.ejs',{doctor:specifiedDoctor})
    }catch(err){
        res.render("FAQ.ejs")
    }
})

app.post('/comment/:id/send', async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        // مطمئن شو که کاربر لاگین است
        if (!req.session.user) {
            return res.status(401).json({ message: "لطفاً ابتدا وارد حساب خود شوید" });
        }

        const userId = req.session.user.id;
        const { comment, rating , recommend } = req.body; // داده‌ها از body فچ می‌آیند
        

        const data = {
            user_id: userId,
            doctor_id: id,
            score: parseInt(rating),
            comment: comment,
            suggest:recommend.toString(),
        };

        // ثبت در دیتابیس
        const sendComment = await queries.addCommentToDoctor(data);

        // *** تغییر اصلی اینجاست ***
        // به جای ریدایرکت، یک پیام موفقیت با فرمت JSON می‌فرستیم
        res.status(200).json({ 
            status: "success", 
            message: "نظر شما با موفقیت ثبت شد",
            redirectUrl: `/flow/${id}` // اگر خواستی بعد از فچ کاربر را منتقل کنی
        });

    } catch (err) {
        console.log(err);
        // ارسال خطای سرور به صورت JSON
        res.status(500).json({ 
            status: "error", 
            message: "خطایی در ثبت نظر رخ داد" 
        });
    }
});

app.get('/index3', (req, res) => {
    try {
        res.render("index3.ejs")
    } catch (err) {
        res.render("FAQ.ejs")
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

app.get('/test-salamat', (req, res) =>{
    try { 
        res.render("test-salamat.ejs");
    }
    catch(err){
        res.render("FAQ.ejs")
    }
})

//Login check
app.get('/check-login' , (req , res) => {
    if(req.session.user) 
        res.status(200).json({authenticated: true})
    else{
        res.status(401).json({authenticated: false , message:'ابتدا باید ثبت نام کنید یا وارد شوید'})
    }
})

app.listen(PORT, () => {
    console.log(`running on http://localhost:${PORT}`);
})