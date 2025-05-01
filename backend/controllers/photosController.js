const fs = require('fs');

const readData = () => JSON.parse(fs.readFileSync('photoData.json'));
const writeData = (data) => fs.writeFileSync('photoData.json', JSON.stringify(data, null, 2));

exports.getAllPhotos = (req, res) => {
    console.log("Got all photos.");
    res.json(readData());
};

exports.getPhotoById = (req, res) => {
    const photos = readData();
    const photo = photos.find(i => i.id == req.params.id);
    if (photo) {
        res.json(photo);
        console.log("Found photo.");
    }
    else {
        res.status(404).send({ error: 'Photo not found' });
        console.log("Photo not found.");
    }
}

exports.addPhoto = (req, res) => {
    console.log("Starting add photo.");
    const photos = readData();
    const newPhoto = { id: Date.now(), ...req.body };
    console.log(photos);
    photos.push(newPhoto);
    writeData(photos);
    res.status(201).json(newPhoto);
    console.log("Added photo.");
};
  
exports.deletePhoto = (req, res) => {
    let photos = readData();
    const newPhotos = photos.filter(i => i.id != req.params.id);
    if (newPhotos.length === photos.length) {
        console.log("Photo not found.");
        return res.status(404).send({ error: 'Photo not found' });
    }
    console.log("Deleted photo.");
    writeData(newPhotos);
    res.status(204).send();
};