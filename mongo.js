const mongoose = require('mongoose')

if (process.argv.length < 2) {
    console.log('enter your password')
    process.exit(1)
}

// Retrieving values from the console
const password = process.argv[2]
const name = process.argv[3] || null
const number = process.argv[4] || null

const url = `mongodb+srv://geraldho:${password}@cluster0.otoiz2u.mongodb.net/phoneNumberApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const phoneNumberSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const PhoneNumber = mongoose.model('PhoneNumber', phoneNumberSchema)

const savePhoneNumber = async (name, number) => {
    try {
        const phoneNumber = new PhoneNumber({ name, number })
        await phoneNumber.save()
        console.log(`added ${name} number ${number} to phonebook`)
    } catch (error) {
        console.log('Error saving phone number:', error)
    }
}

const showAllNumber = async () => {
    try {
        const result = await PhoneNumber.find({})
        console.log('phonebook:')
        result.forEach((person) => {
            console.log(`${person.name} ${person.number}`)
        })
    } catch (error) {
        console.log('Invalid Query', error)
    }
}

const main = async () => {
    if (name && number) {
        await savePhoneNumber(name, number)
    } else if (!name && !number) {
        await showAllNumber()
    } else {
        console.log('Invalid Arguments To Console')
    }

    mongoose.connection.close()
}

main()
