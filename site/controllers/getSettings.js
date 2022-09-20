const Settings = require('../models/settings');


exports.getSettings = async (req, res) => {
    const skip = ['_id', 'downloadUrl', 'autoDownload', 'containsAnswer', 'token', '__v', 'lang'];
    const stringSettings = ["triviaChannel"];
    const numberSettings = ["startTime", "hintTime", "skipTime", "betweenTime", "maxQuestionNum"];
    const booleanSettings = ["anyoneStart", "anyoneStop", "anyoneAnswer", "tiebreaker"];
    try {
        const getSettings = await Settings.find();

        let form = '<form id="settingsForm">\n';

        for (const [key, value] of Object.entries(getSettings[0]._doc)) {
            if (!skip.includes(key)) {
                if (stringSettings.includes(key)) {
                    form += `
                    <div class="form-group row">
                    <label for="${key}" class="col-sm-3 col-form-label">${key}</label>
                    <div class="col-sm-2">
                    <input type="text" class="form-control" id="${key}" value="${value}"><br />
                    </div>
                    </div>
                `;
                }

                if (numberSettings.includes(key)) {
                    form += `
                    <div class="form-group row">
                    <label for="${key}" class="col-sm-3 col-form-label">${key}</label>
                    <div class="col-sm-2">
                    <input type="number" class="form-control" id="${key}" value="${value}">
                    </div>
                    </div>
                `;
                }

                if (booleanSettings.includes(key)) {
                    form += `
                    <div class="form-group row">
                    <label for="${key}" class="col-sm-3 col-form-label">${key}</label>
                    <div class="col-sm-2">
                    <input type="checkbox" class="form-control" id="${key}" value="${value}">
                    </div>
                    </div>
                `;
                }
            }
        }


        form += `
        <div class="form-group">
        <input type="submit" value="submit" id="settingsSubmit">
        </div>
        `
        res.render('settingsTable', { data: form });

    } catch (err) {
        return res.status(500).json({ message: err.message })
    }

}