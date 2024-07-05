var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    email: { type: String, lowercase: true, required: true, unique: true },
    username: { type: String, lowercase: true, required: true, },
    password: { type: String, required: true },
    timeCreated: { type: Date, default: new Date() },
    points: { type: Number, default: 0 },
}, {
    virtuals: {
        url() { return `posts/user/${_id}` }
    }
}
);

module.exports = mongoose.model("User", userSchema)
