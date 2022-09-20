const Settings = require('../models/settings');


exports.startSettings = async (req, res) => {

    const addSettingDB = new Settings();

    try {
        const newSetting = await addSettingDB.save();
        console.log("Question added to database");
        return res.status(201).json(newSetting);
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: err.message });
    }

}