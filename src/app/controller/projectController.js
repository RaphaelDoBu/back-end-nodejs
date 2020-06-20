const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const Project = require('../models/project');

router.use(authMiddleware);

router.get('', async (req, res) => {
    try{
        const projects = await Project.find();
        return res.send({projects});
    }
    catch(err){
        return res.status(400).send({error: 'Error loading projects'})
    }
});

router.get('/:projectId', async(req, res) => {
    res.send({user: req.userId})
});

router.post('/', async(req, res) => {
    try{
        const project = await Project.create(req.body);

        return res.send({project})
    } catch (err){
        return res.status(400).send({error: 'Error creating new project'})
    }
});

router.put('/:projectId', async(req, res) => {
    res.send({user: req.userId})
});

router.delete('/:projectId', async(req, res) => {
    res.send({user: req.userId})
});

module.exports = app => app.use('/projects', router);