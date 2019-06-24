
const mongoose = require('mongoose');

const Person = mongoose.model('Person', {
    username: String,
    passwordHash: String
})

module.exports = Person;