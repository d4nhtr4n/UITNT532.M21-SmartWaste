const express = require('express');

const router = express.Router()

const deviceModel = require('../models/device');

module.exports = router;

router.post('/post', async (req, res) => {
    const data = new deviceModel({
        name: req.body.name,
        status: req.body.status,
        address: req.body.address,
        lastUpdated: new Date()
    })
    try {
        const dataToSave = await data.save();
        res.status(200).json(dataToSave)
    }
    catch (error) {
        res.status(400).json({message: error.message})
    }
})

//Get by ID
router.get('/getOne/:id', async (req, res) => {
    try{
        const data = await deviceModel.findById(req.params.id);
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//Get All
router.get('/getAll', async (req, res) => {
    try{
        const data = await deviceModel.find().sort({_id:-1});
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//Update by ID
router.patch('/update/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updatedData = req.body;
        const options = { new: true };

        const result = await deviceModel.findByIdAndUpdate(
            id, updatedData, options
        )

        res.send(result)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})