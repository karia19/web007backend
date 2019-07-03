
const express = require('express');
const morgan = require('morgan');
const bodyparser = require('body-parser')
const cors = require('cors')
const multer = require('multer');
const mongoose = require('mongoose');
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const path = require('path')
const nodemailer = require('nodemailer');
const checkAuth = require('./middleware/check-auth')

// Models folder stuff ///
const storage = require('./models/Grid')
const own = require('./mogoConnection')
const passOwn = require('./passwordConnection')
//const upload = multer({ dest: 'uploads/' });

const loginRouter = require('./controllers/login');
const emailRouter = require('./controllers/mail');

const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(morgan('tiny'));
app.use(cors());
app.use(methodOverride('_method'));
app.set('view engine' , 'ejs')
app.use(express.static('build'))


require('dotenv').config()

let gfs;

own.conn.once('open', () => {
    gfs = Grid(own.conn.db, mongoose.mongo);
    gfs.collection('uploads');
})

const upload = multer({ storage });

/// Login ///
app.use('/api', loginRouter);

/// Mail ///
app.use('/lomake', emailRouter );
/*
const transport = nodemailer.createTransport({
    
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_ADRESS ,
      pass: process.env.EMAIL_PASSWORD
  }
})


app.post('/lomake', async (req, res) => {
 
  const uusi = await req.body
  var mailOptions = {
    from: 'youremail@gmail.com',
    replyTo: uusi.replyTo,
    to: process.env.EMAIL_ADRESS,
    subject: uusi.subject,
    text: uusi.text
  };
  res.type('application/json');
  
 
  transport.sendMail(mailOptions, (err, info) => {
      if(info){
          res.status(200).send({ message: 'viesti onnistui'})
      } else {
          console.log(err)
          res.status(401).send({ message: "Error" })
      }
      
  })
  

})
*/


app.post('/testi', async (req, res) => {
  gfs.files.deleteOne({ filename: "a14bda4edb6fe7c8616fa40b9faba492.jpg" })
  res.redirect('/')
})

app.get('/react', async (req, res) => {
    res.render('first')
    
   
})

app.post('/api/form', async (req, res)  => {
    const m = await req.body;
    res.send("ok");
    console.log(m)
})

/// Upload image to MongoDb ///
app.post('/upload' , upload.single('file'),  async (req, res) => {
  console.log(req.file)
  res.sendStatus(200)
})

app.get('/files', async  (req, res) => {
   // var gfs =  Grid(own.conn.db, mongoose.mongo);
    const re = await gfs.files.find().toArray()

    if (re.lenght === 0){
        return res.status(404);
    } else {
        return res.json(re)
    }    
})

app.get('/files/:name', async  (req, res) => {
     const b = await req.params;
    // var gfs =  Grid(own.conn.db, mongoose.mongo);
     const re = await gfs.files.findOne({ filename: b.name})
    
     if (re.lenght === 0){
         return res.status(404).json({ warning: "No image found" });
     } 
     if(re.contentType === "image/jpeg"){
       const readStream =  gfs.createReadStream(re.filename);
       readStream.pipe(res);

     } else {
       return res.status(404).send({ warning: "content not a image"})
     }
})


app.delete('/files/:id', checkAuth, (req, res) => {
  gfs.remove({ _id: req.params.id, root: 'uploads'}, (err, file) => {
      if (err) {
          return res.status(404).json({ error: "Something went wriong"})
      }

      res.status(200)
  })
});





PORT = 3003
console.log(PORT)
app.listen(PORT)