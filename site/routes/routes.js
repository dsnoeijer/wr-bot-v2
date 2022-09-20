const express = require('express');
const router = express.Router();
const multer = require('multer');
const addQuestions = require('../controllers/addQuestion');
const listQuestions = require('../controllers/listQuestions');
const getQuestion = require('../controllers/getQuestion');
const getListOfQuestions = require('../controllers//getListOfQuestions');
// const getUser = require('../controllers/verify');
const changeSettings = require('../controllers/changeSettings');
const getSettings = require('../controllers/getSettings');


const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `/${file.originalname}`);
    },
});

const upload = multer({
    storage: multerStorage
})

// Home page
router.get("/", (req, res) => {
    res.render("home");
});

// Getting all questions
router.get('/questions', listQuestions.listQuestions);

// Getting one question
router.get('/question', getQuestion.getQuestion);

// Getting x question
router.get('/questionlist', getListOfQuestions.getListOfQuestions);

// Updating a question
router.post('/update', (req, res) => {

})
// Deleting a question
router.get('/delete/:id', (req, res) => {
    res.send(req.params.id);
})

// Creating a question - page
router.get("/add", (req, res) => {
    res.render("add");
})

// Adding a question
router.post("/uploads", upload.array("files"), addQuestions.addQuestion);

// verify user
// router.post("/verify", getUser.getUser);

//change settings page
router.get("/showsettings", getSettings.getSettings)

// get settings from database
router.get("/getsettings", getSettings.getSettings);

// update settings
// router.post("/updatesettings", changeSettings.changeSettings);

router.get("/commands", (req, res) => {
    res.render("commands");
})


module.exports = router;