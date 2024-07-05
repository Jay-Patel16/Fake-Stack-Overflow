// Question Document Schema

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var questionSchema = new Schema(
    {
        title: { type: String, required: true, maxLength: 50 },
        summary: { type: String, required: true, maxLength: 140 },
        text: { type: String, required: true },
        tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
        answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
        asked_by: { type: Schema.Types.ObjectId, ref: 'User' },
        ask_date_time: { type: Date, default: new Date() },
        views: { type: Number, default: 0 },
        votes: { type: Number, default: 0 },
        comments: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],

    }, {
    virtuals: {
        url() { return `posts/question/${_id}` }
    }
}
);

module.exports = mongoose.model("Question", questionSchema)