const Question = require('../models/questions');
const database = require('../mdb');


exports.getListOfQuestions = async (req, res) => {

    try {
        const cursor = await Question.aggregate(
            [
                { $sample: { size: 75 } }
            ]
        );

        res.send(cursor);
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

}