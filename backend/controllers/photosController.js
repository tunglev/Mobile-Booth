const fs = require('fs');

const readData = () => JSON.parse(fs.readFileSync('photoData.json'));
const writeData = (data) => fs.writeFileSync('photoData.json', JSON.stringify(data, null, 2));

exports.getAllPhotos = (req, res) => {
    res.json(readData());
};

exports.getPhotoById = (req, res) => {
    const photos = readData();
    const photo = photos.find(i => i.id == req.params.id);
    if (photo) res.json(photo);
    else res.status(404).send({ error: 'Photo not found' });
}

exports.addPhoto = (req, res) => {
    const photos = readData();
    const newPhoto = { id: Date.now(), ...req.body };
    photos.push(newPhoto);
    writeData(photos);
    res.status(201).json(newPhoto);
};
  
exports.deleteItem = (req, res) => {
    let photos = readData();
    const newPhotos = photos.filter(i => i.id != req.params.id);
    if (newPhotos.length === photos.length) return res.status(404).send({ error: 'Item not found' });
  
    writeData(newPhotos);
    res.status(204).send();
};