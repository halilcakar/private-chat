var UUID = function () {
    return 'xxxx-yxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = (c === 'x') ? r : (r & 0x3 | 0x8);

        return v.toString(16);
    });
};

var Last = function (arr) {
    return arr[arr.length - 1];
}

module.exports.UUID = UUID;
module.exports.Last = Last;

