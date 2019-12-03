const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/task');

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};
    if(req.query.completed) {
        match.completed = req.query.completed === 'true';
    }
    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
    await req.user.populate({
        path: 'tasks',
        match,
        options: {
            skip: parseInt(req.query.smth),
            limit: parseInt(req.query.limit),
            sort
        }
    }).execPopulate();
    res.send(req.user.tasks);
    } catch (e) {
        res.status(404).send();
    }
});

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({
            _id, owner: req.user._id }, {},{}, (e));

        if(!task) {
            return res.status(404).send('Cannot find task')
        }
        res.send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const validUpdates = ['description', 'completed'];
    const isValidUpdate = updates.every(update => {
        return validUpdates.includes(update);
    });

    if(!isValidUpdate) {
        return res.status(400).send({ error: 'There is no such field'});
    }
    try {
        const task = await Task.findOne({
            _id: req.params.id, owner: req.user._id });

        if(!task) {
            return res.status(404).send({ error: 'There is no such task'});
        }
        updates.forEach(update => {
            task[update] = req.body[update];
        });
        await task.save();
        res.send(task);
    } catch (e) {
        res.status(400).send('Invalid request:');
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id, owner: req.user._id
        });
        if(!task) {
            return res.status(404).send('Task not found');
        }
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;