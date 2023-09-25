const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../modules/Note');
const { body, validationResult } = require('express-validator');


// route1 : get all user notes
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

// route 2 : add notes
router.post('/newnote', fetchuser, [
    body('title', 'Enter a valid Name').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() })
        }

        const note = new Note({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()

        res.json(savedNote)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

// route 3 : Update note
router.put('/updatenote/:id', fetchuser, [
    body('title', 'Enter a valid Name').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        //create newNote object
        const newNote = {}
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };


        // find the note to update
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(400).send("Not found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

// route 4 : delete note
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
// find the note to delete
        let note = await Note.findById(req.params.id);
        if (!note) { return res.status(400).send("Not found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }
        note = await Note.findByIdAndDelete(req.params.id)
        res.json({"success": "note has been deleted", note:note})
        
    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

module.exports = router;