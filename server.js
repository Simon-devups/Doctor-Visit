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
import cron from 'node-cron';
import queries from "./queries.js";
import upload from "./multer.js";
// import EnglishToPersian from "./middlewares/EnglishTopersian.js";
import internetCheck from './middlewares/internetCheck.js';
import bcrypt from "bcrypt";

dotenv.config()

// initialise some important variable
const app = express()
const PORT = process.env.PORT;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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


// middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, './frontend')));
app.set('views', path.join(__dirname, './frontend'));
app.use(cors());
// app.use(internetCheck)


// authentication middleware
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

//
cron.schedule('*/5 * * * *', async () => {
    await queries.pasteAppointmentToDone();
})
//functions
function toPersianDigits(str) {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.toString().replace(/\d/g, x => farsiDigits[x]);
}

async function availableAppointment(doctorId){
    const now = new Date()
    const timeout = 3000;

    let tomorrow = new Date(now);

    // const weekday = (now.getDay() + 1) % 7;
    let appointment = null;
    while(appointment == null){
        const emptyTimes = await queries.getDoctorEmptyTimes(doctorId,tomorrow)

        for (const time of emptyTimes){
            if(time.isAvailable === true) {
                appointment = {
                    date:tomorrow.toISOString().split("T")[0],
                    time:time.start
                }
                // appointment =  new Date(`${tomorrow.toISOString().split("T")[0]}T${time.start}`);
                break;
            }
        }
    
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (Date.now() - now > timeout) {
            console.log('⏰ timeout!');
            break;
        }
    
    }
    return appointment
}

const CODE = '12345';



//home page
app.get('/',async (req, res) => {

    try {
        
        const topDoctors = await queries.getTopDoctors()
        const emptyTimes = await queries.getDoctorEmptyTimes(3,new Date())
        console.log(emptyTimes)

        
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

app.get('/choserole',async (req, res) => {

    try {
        res.render("role.ejs")
    } catch (err) {
        res.render("FAQ.ejs")
    }
})

//login page and signup
app.get('/login', (req, res) => {
    try {
        res.render("login.ejs")
    } catch (err) {
        res.render("FAQ.ejs")
    }
})

app.get('/signUp',(req,res)=>{
    res.render('signUp.ejs')
})


app.post('/signUp', upload.single("avatar") , async(req,res) => {
    try{
        const user = req.body

        const userExisting = await queries.findUser(user.phone)
        if(userExisting) res.json({message:'ثبت نام کرده اید'})

        let filename = "empty.png"
        if(req.file) filename = req.file.filename

        
        const signUpUser = await queries.signUpUser(user,filename)
        res.redirect('/login')
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

        //return date of first available appointment
        const time = await availableAppointment(id);
        let availableApt = {}
        if(time == null){
            availableApt = {
                date : 'وقت ملاقات پیدا نشد'
            }
        }else{
            const availableAptDate = new Intl.DateTimeFormat('fa-IR', {
                dateStyle: 'long'}).format(new Date(time.date));
            availableApt = {
                date:availableAptDate.toString().slice(0,7),
                weekday:new Date(time.date).getDay()+1
        }}
        
        


        
        let sum = 0;
        doctorComments.forEach(comment=>{
            const persianDate = new Intl.DateTimeFormat('fa-IR', {
                dateStyle: 'long'}).format(comment.date);
            comment.date = persianDate
            
            // number of true rating
            if(comment.suggest == 'true') sum+=1
        })

        //doctor rating
        const doctorRecommend = parseInt((sum/(doctorComments.length))*100)

        //result example : [0,1,2,3,4]
        const workingDaysInWeek = await queries.getDoctorWorkingDays(id)  // 0:saturday  ,  1:sonday  ,  ...
        

        res.render("flow.ejs" , {
            doctor : specifiedDoctor , 
            contact:contact , comments:doctorComments ,
            doctorRecommend:doctorRecommend,
            availableAppointment:availableApt,
        })
    } catch (err) {
        console.log(err)
        res.render("FAQ.ejs")
    }
})

// check doctor working hours for apecified day
app.get('/calender/:id/checkDay',async(req,res)=>{
    const doctorId = parseInt(req.params.id);
    try{
        const date = new Date(req.query.date);
        //request example : {date:'2026-02-11'}
        const emptyTimes = await queries.getDoctorEmptyTimes(doctorId,date)
        // response example : [
        //{ start: '09:00', isAvailable: true },{ start: '09:30', isAvailable: true },{ start: '10:00', isAvailable: true },...
        //]
        console.log(emptyTimes)

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

        const {date,time} = req.query
        
        const specifiedDoctor = await queries.getDoctorById(doctorId)

        const user = req.session.user
        const dateInfo = new Date(`${date}T${time}:00`)
        console.log(dateInfo)

        const appointment = await queries.addAppointmentToPendingList(doctorId,user.id,dateInfo)

        res.render("flow2.ejs",{doctor:specifiedDoctor})
    }catch(err){
        console.log(err)
        res.status(500).json({ 
            status: "error", 
            message: "خطا در برقراری ارتباط" 
        });
    }
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
        

        ConfirmedreserveList.forEach(appointment=>{
            const now = new Date();
            const date = new Date(appointment.date);

            // how much day and hour to appointment
            const day = (date - now) / (1000 * 60 * 60 * 24);
            appointment.before =  {
                day:parseInt(day),
                hour:parseInt((day - parseInt(day))*24),
            };

            const persianDate = new Intl.DateTimeFormat('fa-IR', {
                dateStyle: 'long'}).format(appointment.date);
            
            const persianHour = new Intl.DateTimeFormat('fa-IR',{
                timeZone: 'Asia/Tehran',
                hour: '2-digit',
                minute: '2-digit'
            }).format(appointment.date)
            appointment.date = {date:persianDate,hour:persianHour}
            console.log(now , date)
        })

        console.log()

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


// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------
// ADMIN PAGES

const saltRound = 10;

app.get("/login/doctor", (req, res) => {
    try {
        res.render("doctorlogin.ejs")
    } catch (err) {
        res.render("FAQ.ejs")
    }
})

app.post("/login/doctor",async(req,res)=>{
    try{
        const {code,password} = req.body;
        
        const doctorExisting = await queries.checkDoctorExisting(code)
        if(doctorExisting.length<1) res.json({message:'first sign up'})

        const doctorPass = await queries.findDoctorpass(code)

        const match = await bcrypt.compare(password,doctorPass)
        if (!match) return res.status(400)

        req.session.doctor = {
            id: doctorExisting.doctorId,
            code: code,
        };
        
        res.redirect(`/doctor/${doctorExisting.doctorId}/list`)
    }catch(err){
        console.log(err)
        res.send(500).json({
            data:'an error accured!'
        })
    }
})

app.get('/signup/doctor',async (req, res) => {
    try {
        // const deleteInvalidPass = await queries.checkPasswordValidation();

        // console.log(deleteInvalidPass)
        const spetialties = await queries.getSpetialties()

        res.render("doctor-signup.ejs",{spti:spetialties})
        //{topDoctors:topDoctors,oldDoctors:oldDoctor}
    } catch (err) {
        console.log(err)
        res.render("FAQ.ejs")
    }
})

app.post('/signup/doctor',async (req, res) => {
    try {
        let redirectUrl = "/login/doctor";

        const info = req.body;
        console.log(info)
        const DoctorExisting = await queries.checkDoctorExisting(info.medical_code)
        
        if(DoctorExisting) return res.json({message:"شما قبلا ثبت نام کرده اید"})
        
        const data = {
            first_name:info.first[0],
            last_name:info.last,
            spetialty_id:parseInt(info.spetialty),
            image_url:'',
            // totalReservs:0,
            doctorInfo:{
                create:{
                    natinalCode:parseInt(info.natinolCode),
                    password:''
                }
            },
            description:{
                create:{
                    description:'',
                    city:info.city,
                    Addres:info.address,
                    code:info.medical_code,
                    insurance:'',
                    gender:info.gender
                }
            }
        }
        const signUpDoctor = await queries.createDoctorAccount(data)

        const Doctor = await queries.checkDoctorExisting(info.medical_code);
        const doctorId = Doctor.doctorId;

        res.redirect(`/signup/doctor/${doctorId}`)
    } catch (err) {
        console.log(err)
        res.render("FAQ.ejs")
    }
})

app.get("/signup/doctor/:id",async(req,res)=>{
    try{
        const doctorId = parseInt(req.params.id);
        res.render('password.ejs',{id:doctorId})
    }catch(err){}
})

app.post('/signup/doctor/:id/setpassword',async(req,res)=>{
    const doctorId = parseInt(req.params.id);
    try{
        const {password,confirm} = req.body;
        
        if(password != confirm) return res.json({message:'پسورد هماهنگ نیست'})

        const hash = await bcrypt.hash(password,saltRound);
        const setPass = await queries.setPassToDoctor(doctorId,hash)

        res.redirect('/login/doctor')
    }catch(err){
        console.log(err)
    }
})

app.get('/doctor/:id/list',async (req, res) => {
    const doctorId = parseInt(req.params.id);
    try {
        // get appointment of doctor (with id)
        const doctorAppointment = await queries.getDoctorAppointment(1)
        

        doctorAppointment.forEach(appointment=>{
            const now = new Date();
            const date = new Date(appointment.date);

            // how much day and hour to appointment
            const day = (date - now) / (1000 * 60 * 60 * 24);
            appointment.before =  {
                day:parseInt(day),
                hour:parseInt((day - parseInt(day))*24),
            };

            const persianDate = new Intl.DateTimeFormat('fa-IR', {
                dateStyle: 'long'}).format(appointment.date);
            
            const persianHour = new Intl.DateTimeFormat('fa-IR',{
                timeZone: 'Asia/Tehran',
                hour: '2-digit',
                minute: '2-digit'
            }).format(appointment.date)
            appointment.date = {date:persianDate,hour:persianHour}
            
        })
        console.log(doctorAppointment)

        
        res.render("list-doctor.ejs",{reservs:doctorAppointment})
        //{topDoctors:topDoctors,oldDoctors:oldDoctor}
    } catch (err) {
        res.render("FAQ.ejs")
    }
})

app.get("/doctor/list/patient/:id",async (req, res) => {
    const patientId = parseInt(req.params.id);
    try {
        // a query that take patient informations
        const patientInfo = await queries.findUserById(patientId)
        console.log(patientInfo)
        
        res.render("user.ejs",{data:patientInfo})
    } catch (err) {
        res.render("FAQ.ejs")
    }
})

app.get('/profile/doctor',async (req, res) => {
    try {
        res.render("doctor-profile.ejs")
    } catch (err) {
        res.render("FAQ.ejs")
    }
})







// run port

app.listen(PORT, () => {
    console.log(`running on http://localhost:${PORT}`);
})