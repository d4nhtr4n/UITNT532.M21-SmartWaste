const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },
    status: {
        required: true,
        type: Number //0: empty, 1: full
    },
    address: {
        latitude: {
            required: true,
            type: Number
        },
        longitude: {
            required: true,
            type: Number
        }
    },
    lastUpdated: {
        required: true,
        type: Date
    }
})

module.exports = mongoose.model('Device', deviceSchema)