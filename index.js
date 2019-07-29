
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
const vhost = require("vhost")
const fs = require('fs')
const app = express();
const http = require('http')
const https = require('https')

// Models folder stuff ///
const storage = require('./models/Grid')
const own = require('./mogoConnection')
const passOwn = require('./passwordConnection')
//const upload = multer({ dest: 'uploads/' });

const loginRouter = require('./controllers/login');
const emailRouter = require('./controllers/mail');

/*
//// Make letsencrupt //////

const privateKey = fs.readFileSync('/etc/letsencrypt/live/pekkaparviainen.com/privkey.pem', 'utf8')
const certificate = fs.readFileSync('etc/letsencrypt/live/pekkaparviainen.com/fullchain.pem', 'utf8')
const ca = fs.readFileSync('/etc/letsencrypt/live/pekkaparviainen.com/chain.pem', 'utf8')

const credentials = {
     key: privateKey,
     cert: certificate,
     ca: ca
}

app.get('/', (req, res) => {
    res.redirect('https://pekkaparviainen.com/home/')
})


/// 30 2 * * 1 /opt/letsencrypt/letsencrypt-auto certonly --webroot -w /home/user/node-https-example/client/www -d www.node-https-example.com -d node-https-example.com >> /var/log/le-renew.log


*/

app.get('/' , (req, res, next) => {
  res.redirect('/home/');
})

/// Route different Sites ///
app.use(express.static('buildweb'))
app.use(express.static('build'))
//app.use(express.static(path.join(__dirname, 'buildweb')))
//app.use('/pekkauserinterface', express.static(path.join(__dirname, 'build')))



//// More Config ////

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(morgan('tiny'));
app.use(cors());
app.use(methodOverride('_method'));
app.set('view engine' , 'ejs')

//app.use(express.static('build'));
//app.use(express.static("buildFront"))


require('dotenv').config()

let gfs;



/*
app.use(express.static(path.join(__dirname, 'build')));

*/



/*
app.get('/pekkauserinterface', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


app.get('./*', function (req, res) {
  console.log("What")
  res.sendFile(path.join(__dirname, 'buildweb', 'index.html'));
});
*/
// Admin paths
app.use('/pekkauserinterface', express.static(path.join(__dirname, 'build')))
app.get('/pekkauserinterface', function (req, res) {
 res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Site path
app.use('/home', express.static(path.join(__dirname, 'buildweb')))

app.get('/home/*', function (req, res) {
 res.sendFile(path.join(__dirname, 'buildweb', 'index.html'));
});


/*

//// Connetct mongo to local datbase ////

const mongoUri = 'mongodb://localhost:27017/myapp'
const conn = mongoose.createConnection(mongoUri , { useNewUrlParser: true } );



conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
})

*/



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

app.post('/api/form', async (req, res)  => {
    const m = await req.body;
    res.send("ok");
    console.log(m)
})

/// Upload image to MongoDb ///
app.post('/api/upload' ,checkAuth, upload.single('file'),  async (req, res) => {
  console.log(req.file)
  res.sendStatus(200)
})

app.get('/api/files', async  (req, res) => {
   // var gfs =  Grid(own.conn.db, mongoose.mongo);
    const re = await gfs.files.find().toArray()

    if (re.lenght === 0){
        return res.status(404);
    } else {
        return res.json(re)
    }    
})

app.get('/api/files/:name', async  (req, res) => {
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



app.delete('/api/files/:id',checkAuth,   (req, res) => {
  gfs.remove({ _id: req.params.id, root: 'uploads'}, async (err, file) => {
      if (err) {
          return res.status(404).json({ error: "Something went wrong"})
      } 
      const re = await gfs.files.find().toArray()
      return res.status(200).json(re);
  })
});





PORT = 3003
console.log(PORT)
app.listen(PORT)

/*

//// Http and Https servers ////
const httpServer = http.createServer(app)
const httpsServer = https.createServer(credentials, app)

httpServer.listen(80, () => {
  
})

httpsServer.listen(443, () => {

})

*/