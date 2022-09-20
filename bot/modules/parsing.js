const { options } = require('./options');
const { settings } = require('./settings');


function clean(unclean) {
    unclean = unclean.toLowerCase();
    for (const element of local.clean) {
        unclean = unclean.replace(new RegExp(element[0], "g"), element[1]);
    }
    return unclean.trim();
}

function cleanTypos(unclean) {
    for (const element of local.typos) {
        unclean = unclean.replace(new RegExp(element[0], "g"), element[1]);
    }
    return unclean;
}

function parseAnswer(answer, correct) {
    // string is lowercased, trimmed, and multiple spaces removed, accented characters are normalized, & is turned to and, all non-alphanumeric characters removed
    let cleanAnswer = clean(answer);
    for (const element of correct) {
        // each answer choice is cleaned and compared
        if (!settings.containsAnswer && ((answer === element) || (cleanAnswer.length > 0 && ((cleanAnswer === clean(element)) || (cleanTypos(cleanAnswer) === cleanTypos(clean(element))))))) {
            // exact match
            return true;
        }
        else if (settings.containsAnswer && ((answer.indexOf(element) !== -1) || (cleanAnswer.length > 0 && ((cleanAnswer.indexOf(clean(element)) !== -1) || (cleanTypos(cleanAnswer).indexOf(cleanTypos(clean(element))) !== -1))))) {
            // contains match
            return true;
        }
    }
    return false;
}

exports.clean = clean;
exports.cleanTypos = cleanTypos;
exports.parseAnswer = parseAnswer;