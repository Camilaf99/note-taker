const express = require('express');
const fs = require('fs');
const path = require('path'); 
const nanoid = require('nanoid');

const app = express();
const PORT = 5000;

app.use(express.static('public'));
app.use(express.json());

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

function readJsonFromDB() {
    let rawdata = fs.readFileSync('./db/db.json');
    return JSON.parse(rawdata);
}

function saveJsonToDB(notes) {
    let data = JSON.stringify(notes);
    fs.writeFileSync('./db/db.json', data);
    return notes;
}

app.get('/api/notes', (req, res) => {
    res.json(readJsonFromDB());
});

app.post('/api/notes', (req, res) => {
    let notevalues = req.body;
    // Checks input is correct
    console.log("Note Values: ", notevalues);
    console.log("Title: ", notevalues.title);
    console.log("Text: ", notevalues.text);
    if(notevalues && 
       notevalues.title && notevalues.title.trim() !== "" && 
       notevalues.text && notevalues.text.trim() !== "") {
        
        // Accepts the note
        let noteEntry = { id: nanoid.nanoid(), title: notevalues.title, text: notevalues.text };
        
        // Opens the file
        let noteFile = readJsonFromDB();
        
        // Put the note at the end
        noteFile.notes.push(noteEntry);

        // Save file // Write
        saveJsonToDB(noteFile);

        res.status(201);
        res.json(noteFile);
    } else {
        res.status(400);
        res.send('Bad argument');
    }
});

app.delete('/api/notes/:id', (req, res) => {
    let noteId = req.params.id; 
    console.log('Deleting note: ', noteId);
    if (noteId) {
        let noteFile = readJsonFromDB();

        noteFile.notes = noteFile.notes.filter(note => note.id !== noteId);

        saveJsonToDB(noteFile);

        res.status(200);
        res.send('{}');
    } else {
        res.status(400);
        res.send('Bad argument');
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.listen(PORT, (error) => {
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
});

