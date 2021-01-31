require('dotenv/config')
const express = require('express')
const multer = require('multer')
const AWS = require('aws-sdk')
// const uuid = require('uuid/v4')
const { v4: uuidv4 } = require('uuid');


const app = express()
const port = 3000
var cors = require('cors')
app.use(cors())

var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 
}

const  s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET
})
const storage = multer.memoryStorage({
  destination: function(req,file,callback){
    callback(null,'')
  }
})

const upload = multer({storage}).single('image')

app.post('/upload',upload,(req,res)=>{

  let myFile = req.file.originalname.split(".")
  const fileType = myFile[myFile.length - 1 ] 

  // console.log(req.file)
  // res.send({
  //   message:"hello world"
  // })

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${uuidv4()}.${fileType}`,
    Body: req.file.buffer
  }

  s3.upload(params, (error, data)=>{
    if(error){
      res.status(500).send(error)
    }
    res.status(200).send(data)
  })
})

app.get('/listVideos', function (req, res) {
  var bucketParams = {
    Bucket : 'awsvideoplaylist',
  };
 
  s3.listObjects(bucketParams, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
      res.send( data.Contents );
    }
  });


})



app.listen(port,()=>{
  console.log(`Server is up at ${port}`)
})