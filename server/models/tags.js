// Tag Document Schema

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var tagSchema = new Schema({
    name: { type: String, lowercase: true, required: true, unique: true },
}, {
    virtuals: {
        url() { return `posts/tag/${_id}` }
    }
}
);

module.exports = mongoose.model("Tag", tagSchema)
