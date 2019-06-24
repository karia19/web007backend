
const express = require('express');
const morgan = require('morgan');
const bodyparser = require('body-parser')
const cors = require('cors')
const multer = require('multer');
const mongoose = require('mongoose');
const mongoImage = require('./models/image');
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const path = require('path')

const checkAuth = require('./middleware/check-auth')

// Models folder stuff ///
const storage = require('./models/Grid')
const own = require('./mogoConnection')
const passOwn = require('./passwordConnection')
//const upload = multer({ dest: 'uploads/' });

const loginRouter = require('./controllers/login');

const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(morgan('tiny'));
app.use(cors());
app.use(methodOverride('_method'));
app.set('view engine' , 'ejs')

require('dotenv').config()

let gfs;

own.conn.once('open', () => {
    gfs = Grid(own.conn.db, mongoose.mongo);
    gfs.collection('uploads');
})

const upload = multer({ storage });

/// Login ///
app.use('/api', loginRouter);




app.get('/testi', async (req, res) => {
  gfs.files.deleteOne({ filename: "news" })
  res.redirect('/')
})

app.get('/', async (req, res) => {
    res.render('first')
    
   
})

app.post('/api/form', async (req, res)  => {
    const m = await req.body;
    res.send("ok");
    console.log(m)
})

/// Upload image to MongoDb ///
app.post('/upload', upload.single('file'),  async (req, res) => {
    //var gfs =  Grid(own.conn.db, mongoose.mongo);  
    const re = await gfs.files.findOne({ filename: req.body.lista })
    if (re.lenght === null){
      res.status(404).json({ warning: "no images found for delete"})
    } else {
      await gfs.files.deleteOne({ filename: req.body.lista })
    }
   // await gfs.files.deleteOne({ filename: "news"})
    console.log(req.file);   
    res.redirect('/');
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



PORT = 3003
console.log(PORT)
app.listen(PORT)