const express = require('express');
var request = require('request');

const router = express.Router()

const dataModel = require('../models/data');
const deviceModel = require('../models/device');

const webhook = 'https://maker.ifttt.com/trigger/bin_filled/with/key/o9Ak8cjuxccJk0WshLxFG-HZBe8xMQ1L-njvlEc2Lfw';
module.exports = router;

async function updateDevice(devceId, data) {
    const filter = { "_id": devceId };
        const updateDocument = {
            $set: {
                status: data.curStatus,
                lastUpdated: data.timestamp
            },
        };
    await deviceModel.updateOne(filter, updateDocument);
}

async function checkAndFireIFTTT() {
    const calTotalDevice = await deviceModel.aggregate( [
        {   $group: { _id: null, count: { $sum: 1 } } }
    ])
    const calFulledDevice = await deviceModel.aggregate( [
        {   $group: { _id: null, count: { $sum: "$status" } } }
    ])
    if(calFulledDevice[0].count/calTotalDevice[0].count>=0.5)
    {
        request.post({url: webhook},function(err,data){
        if(err){
            console.error(err);
            return;
        }
        console.log(data.body);
        })
    }
}

router.post('/post', async (req, res) => {
    var message = req.body.status == 1 ? "Full filled Bin!" : "Empty Bin!"
    const data = new dataModel({
        timestamp: new Date(),
        message: message,
        curStatus: req.body.status,
        from: req.body.from
    })
    try {
        const dataToSave = await data.save();
        
        //update status of device
        await updateDevice(dataToSave.from, data)
        
        //Full filled bin notify
        checkAndFireIFTTT()
        res.status(200).json(dataToSave)
    }
    catch (error) {
        res.status(400).json({message: error.message})
    }
})

//Count how many times the bin full every days for a week
router.get('/getLast10Days', async (req, res) => {
    try{
        let lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() -10);
        const data = await dataModel.aggregate( [
            {   $match: { timestamp: { $gte: lastWeek}}},
            {
                $group: { 
                   _id: { "$dateToString": { "format": "%Y-%m-%d", "date": "$timestamp" }},
                   total: { $sum: '$curStatus' }
                }
            }
        ]).sort({_id:1})
        res.json(data)
        
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})


router.get('/getDeviceStatistic', async (req, res) => {
    try{
        const data = await dataModel.aggregate( [
            {   $sort : {_id:-1}    },
            {
                $group: { 
                   _id:  '$from' ,
                   total: { $sum: '$curStatus' }
                }
            },
            {   
                $lookup: 
                {
                    from: 'devices',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'device'
                }
            }
            
        ])
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//Count total logs
router.get('/getLogsCount', async (req, res) => {
    try{
        const logsCount = await dataModel.aggregate( [
            {   $group: { _id: null, total: { $sum: 1 } } }
        ])
        res.json(logsCount);
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//get log by page
router.get('/getLogs/:page', (req, res, next)=>{
    let perPage = 10;
    let page = req.params.page || 1;
    let skipPage =  (perPage * page) - perPage;
    dataModel.aggregate([
        {   $sort : {_id:-1}    },
        {   $skip:  skipPage    },
        {   $limit: perPage     },
        {   
            $lookup: 
            {
                from: 'devices',
                localField: 'from',
                foreignField: '_id',
                as: 'device'
            }
        }
    ],function (err,logs) {
        if (err) throw err;
        return res.json(logs);
    }); 
})

//get all logs
router.get('/getAllLogs', (req, res, next)=>{
    dataModel.aggregate([
        {   $sort : {_id:-1}    },
        {   
            $lookup: 
            {
                from: 'devices',
                localField: 'from',
                foreignField: '_id',
                as: 'device'
            }
        }
    ],function (err,logs) {
        if (err) throw err;
        return res.json(logs);
    }); 
})


