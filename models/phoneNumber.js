const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB', error.message)
    })

// Validation Function
const validateNumber = (number) => {
    const parts = number.split('-')
    return (
        number.length >= 8 &&
    parts.length === 2 &&
    1 < parts[0].length &&
    parts[0].length <= 3
    )
}

const phoneNumberSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true,
    },
    number: {
        type: String,
        minLength: 8,
        required: true,
        validate: {
            validator: validateNumber,
        },
    },
})

phoneNumberSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    },
})

module.exports = mongoose.model('PhoneNumber', phoneNumberSchema)
