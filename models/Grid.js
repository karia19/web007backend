
const GridFsStorage = require('multer-gridfs-storage');
const path = require('path')
const own = require('../mogoConnection');
const crypto = require('crypto')


const storage = new GridFsStorage({
    url: own.uri,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          //console.log("mitää", req.body.lista)
          //const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: req.body.lista,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
});

module.exports = storage;