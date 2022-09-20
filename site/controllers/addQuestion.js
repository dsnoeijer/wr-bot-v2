const Question = require('../models/questions');


exports.addQuestion = async (req, res) => {

    // console.log(req);

    if (req.files.length !== 0) {
        imagePath = `${req.files[0].destination}${req.files[0].originalname}`;
    } else {
        imagePath = "";
    }

    const lastId = await Question.find().limit(1).sort({ $natural: -1 });
    const numId = lastId[0].id + 1;

    const addQuestionDB = new Question({
        id: numId,
        category: 'wow',
        title: req.body.name,
        question: req.body.question,
        firstHint: req.body.firstHint,
        secondHint: req.body.secondHint,
        answer: req.body.answers,
        imageUrl: imagePath
    })

    try {
        const newQuestion = await addQuestionDB.save();
        console.log("Question added to database");
        return res.status(201).json(newQuestion);
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message });
    }
}