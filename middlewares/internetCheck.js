import axios from 'axios';

async function internetCheck(req, res, next) {
  try {
    await axios.get("https://www.google.com", { timeout: 3000 });
    next(); // اینترنت هست
  } catch (err) {
    res.status(503).render("FAQ.ejs"); // اینترنت نیست
  }
}

export default internetCheck;
