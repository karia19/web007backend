
const nodemailer = require('nodemailer');
const emailRoter = require('express').Router();
require('dotenv').config()



const transport = nodemailer.createTransport({
    
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ADRESS,
        pass: process.env.EMAIL_PASSWORD
    }
})


emailRoter.post('/', async (req, res) => {
    const details = req.body;
    console.log(details)

    const mail = {
        from: 'youremail@gmail.com',
        to: process.env.EMAIL_ADRESS,
        replyTo: details.replyTo,
        subject: details.subject,
        text: details.text
    }
    res.type('application/json');
    
    transport.sendMail(mail, (err, info) => {
        if(info){
            res.status(200).send({ message: 'viesti onnistui'})
        } else {
            console.log(err)
            res.status(401).send({ message: "Error" })
        }
        
    })


})
module.exports = emailRoter;