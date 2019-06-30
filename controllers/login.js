
const loginRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Person = require('../models/person');
const bcrypt = require('bcrypt');

loginRouter.get('/login', (req, res) => {
    res.render('form')
})

/*
loginRouter.post('/register', async (req, res) => {
    try {
        const response = req.body
        const saltRounds = 10;
        const passWordHash = await bcrypt.hash(response.password, saltRounds);

        const person = new Person ({
            username: response.username,
            passwordHash: passWordHash
        })

        const saveUser = await person.save();
        res.json(saveUser);

        console.log(passWordHash);
       



    } catch (e) {
      console.log(e)
      res.status(500).json({ error: "Something hpened"})
    }

   
})
*/

loginRouter.post('/register', async (req, res) => {
    try {
        const response = req.body
        const user = await Person.findOne({ username: response.username });
        const passwordCorrect = user === null ?
            false :
            await bcrypt.compare( response.password, user.passwordHash )

        if ( !(user && passwordCorrect) ) {
            return response.status(401).json({ error: 'invalid username or paswwor' })
        }
        const userForToken = {
            username: user.username,
            id: user._id
        }

        const token = jwt.sign(userForToken, process.env.SECRET)
        res.status(200).send({ token, username: user.username })

    } catch (e) {
      console.log(e)
      res.status(500).json({ error: "Something hapened"})
    }

   
})





module.exports = loginRouter;