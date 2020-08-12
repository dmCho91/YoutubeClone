const express = require('express');
const router = express.Router();
const { Video } = require("../models/Video");

const { auth } = require("../middleware/auth");
const multer = require('multer')
var ffmpeg = require('fluent-ffmpeg');
const { Subscriber } = require('../models/Subscriber');

// STORAGE MULTER CONFIG
let storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if(ext !== '.mp4')
            return cb(res.status(400).end('only mp4 is allowed'), false)
        cb(null, true)
    }
})

const upload = multer({storage: storage}).single("file")

//=================================
//             Video
//=================================

router.post('/uploadfiles', (req, res) => {

    // 비디오를 서버에 저장한다.
    upload(req, res, err => {
        if(err)
            return res.json({ success: false, err })
        return res.json({ success: true, url: res.req.file.path, fileName: res.req.file.filename})
    })
})

router.get('/getVideos', (req, res) => {

    // 비디오를 DB에서 가져와서 클라이언트에 보낸다.
    Video.find()
        .populate('writer') // pupulate하지 않으면 writer의 id만 가져옴
        .exec((err, videos) =>{
            if(err) return res.status(400).send(err)
            res.status(200).json({ success: true, videos})
        })  
})

router.post('/getVideoDetail', (req, res) => {

    Video.findOne({"_id": req.body.videoId})
        .populate('writer')
        .exec((err, videoDetail) => {
            if(err) return res.status(400).send(err)
            return res.status(200).json({ success: true, videoDetail})
        })
})




router.post('/thumbnail', (req, res) =>{
    // 썸네일 생성하고 비디오 러닝타임 가져오기

    let filePath = ""
    let fileDuration = ""


    //비디오 정보 가져오기
    ffmpeg.ffprobe(req.body.url, function(err, metadata){
        console.dir(metadata) // all metadata
        console.log(metadata.format.duration)
        fileDuration = metadata.format.duration
    })

    // 썸네일 생성
    ffmpeg(req.body.url) // url : 비디오저장경로
        .on('filenames', function(filenames){ // 썸네일 파일이름,경로
            console.log('Will generate ' + filenames.join(', '))
            console.log(filenames)

            filePath = "uploads/thumbnails/" + filenames[0]
        })
        .on('end', function(){ // 생성 후 할 일
            console.log('Screensshots taken')
            return res.json({ success: true, url: filePath, fileDuration: fileDuration})
        })
        .on('error', function(err){ // 에러 발생시 처리
            console.log(err)
            return res.json({ success: false, err })
        })
        .screenshot({
            // will take screenshots at 20% 40% 60% and 80% of the video
            count: 1,
            folder: 'uploads/thumbnails',
            size: '320x240',
            // %b : input basename (filename w/o extension)
            filename: 'thumbnail-%b.png'
        })
})

router.post('/uploadVideo', (req, res) => {

    // 비디오 정보들을 저장한다.
    const video = new Video(req.body)

    video.save((err, doc) => {
        if(err) return res.json({ success: false, err })
        res.status(200).json({ success: true})
    })
})

router.post('/getSubscriptionVideos', (req, res) => {
    
    // 자신의 아이디를 가지고 구독하는 사람들을 찾는다
    Subscriber.find({userFrom: req.body.userFrom})
        .exec((err, subscriberInfo) => {
            if(err) return res.status(400).send(err)

            let subscribedUser = []

            subscriberInfo.map((subscriber, i) =>{
                subscribedUser.push(subscriber.userTo)
            })

            // 찾은 사람들의 비디오를 가지고 온다.
            Video.find({writer : { $in: subscribedUser }})
                .populate('writer')
                .exec((err, videos) => {
                    if(err) return res.status(400).send(err)
                    res.status(200).json({success:true, videos})
                })

        })

})

router.post('/upViews', (req, res) => {
    Video.findOne({"_id": req.body.videoId}, (err, doc)=>{
        if(err) return res.json({success: false})

        doc.views++
        doc.save((err, result) => {
            if(err) return res.json({success:false})
        })
        res.status(200).json({success:true, views:doc.views})
    })
})

module.exports = router;
