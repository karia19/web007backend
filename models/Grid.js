
const GridFsStorage = require('multer-gridfs-storage');
const path = require('path')
const own = require('../mogoConnection');
const crypto = require('crypto')

let filename = ''

const storage = new GridFsStorage({
    url: own.uri,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          console.log("mmdsdsd", req.body.lista)
          
          
          const fileInfo = {
            filename: req.body.lista,  
            metadata: {
               artName: req.body.tauluNimi,
               kuvaus: req.body.kuvaus,
               hinta: req.body.hinta,
               vuosi: req.body.vuosi,
               mitat: req.body.mitat
            },
            bucketName: 'uploads',
         

        };
        resolve(fileInfo);
      });
      });
    }
});

module.exports = storage;