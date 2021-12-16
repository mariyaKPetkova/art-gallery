const { Schema, model } = require('mongoose')

const schema = new Schema({
    name: {
        type: String,
        required: [true, 'Title is required'],
        minLength: [6, 'The title must be at least 6 symbols long'],
    },
    technique: {
        type: String,
        required: [true, 'Technique is required'],
        maxLength: [15, 'Technique should be a maximum of 15 characters long']
    },
    imageUrl: {
        type: String,
        required: [true, 'Image is required'],
        match: [/^https?:\/\//, 'Image should start with http:// or https://']
    },
    certificate: {
        type: String,
        required: [true, 'Certificate is required'],
        match: [/^yes$|^no$/igm , 'The certificate should be  Yes or No']
    },
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    share: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    shares: { type: Number, default: 0 }
})

module.exports = model('Product', schema)