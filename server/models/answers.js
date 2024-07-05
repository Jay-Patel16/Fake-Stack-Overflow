// Answer Document Schema

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var answerSchema = new Schema({
    text: { type: String, required: true },
    ans_by: { type: Schema.Types.ObjectId, ref: 'User' },
    ans_date_time: { type: Date, default: new Date() },
    votes: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
}, {
    virtuals: {
        url() { return `posts/question/${_id}` }
    }
}
);

module.exports = mongoose.model("Answer", answerSchema)