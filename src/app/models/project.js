const mongoose = require('../../database/index');
const bcrypt = require('bcryptjs');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    tasks:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('projects', ProjectSchema);

module.exports = User;