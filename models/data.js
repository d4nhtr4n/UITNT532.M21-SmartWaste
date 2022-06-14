const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
    timestamp: {
        required: true,
        type: Date
    },
    message: {
        required: false,
        type: String
    },
    curStatus: {
        required: true,
        type: Number //0: empty, 1: full
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: 'Device'
    },
})

module.exports = mongoose.model('Data', dataSchema)