const { existsSync, writeFile, readFileSync, writeFileSync } = require('fs');
const SQLitePhotoModel = require('../model/SQLitePhotosModel.js');

const photoDataFilePath = "photoData.json";
createJSONifNotExists();

function createJSONifNotExists() {
    if (!existsSync(photoDataFilePath)) {
        writeFile(
            photoDataFilePath,
            JSON.stringify([], null, 2),
            (err) => err ? console.err("Error writing file:", err) : console.log("File created")
        );
    }
}

function readData() {
    createJSONifNotExists();
    return JSON.parse(readFileSync(photoDataFilePath));
} 
function writeData(data) {
    createJSONifNotExists();
    return writeFileSync(photoDataFilePath, JSON.stringify(data, null, 2));
}

async function getAllPhotos(req, res) {
    await SQLitePhotoModel.init();
    console.log("Getting all photos from sql.");
    const allPhotos = await SQLitePhotoModel.read();
    // console.log("All photos:", allPhotos);
    res.json(allPhotos);
}
async function getPhotoById(req, res) {
    await SQLitePhotoModel.init();
    console.log(`Getting photo with id ${req.params.id} from sql.`);
    res.json(SQLitePhotoModel.read(req.params.id));
}
async function addPhoto(req, res) {
    await SQLitePhotoModel.init();
    console.log("Starting add photo");
    // id will be handled by the sql itself, since the default id is a random uuid
    const newPhoto = { 
        photo: req.body.image,
        datetimeuploaded: Date.now(),
    };
    SQLitePhotoModel.create(newPhoto);
    res.status(201).json(newPhoto);

    // try {
    //     const imageBuffer = req.file.buffer;

    //     const photo = await SQLitePhotoModel.create({
    //         photo: imageBuffer,
    //         datetimeuploaded: Date.now(),
    //     });

    //     res.json({ success: true, photoid: photo.photoid });
    // } catch (err) {
    //     console.error("Upload error:", err);
    //     res.status(500).json({ error: "Failed to save photo to database" });
    // }
}

async function deletePhoto(req, res) {
    await SQLitePhotoModel.init();
    console.log("Starting delete photo");
    SQLitePhotoModel.deleteById(req.params.id);
    res.status(204).send();
}

function getAllPhotosJSON(req, res) {
    console.log("Got all photos.");
    res.json(readData());
}

function getPhotoByIdJSON(req, res) {
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

function addPhotoJSON(req, res) {
    console.log("Starting add photo.");
    const photos = readData();
    const newPhoto = { id: Date.now(), ...req.body };
    photos.push(newPhoto);
    writeData(photos);
    res.status(201).json(newPhoto);
    console.log("Added photo.");
}
  
function deletePhotoJSON(req, res) {
    let photos = readData();
    const newPhotos = photos.filter(i => i.id != req.params.id);
    if (newPhotos.length === photos.length) {
        console.log("Photo not found.");
        return res.status(404).send({ error: 'Photo not found' });
    }
    console.log("Deleted photo.");
    writeData(newPhotos);
    res.status(204).send();
}

module.exports = {
    getAllPhotos,
    getPhotoById,
    addPhoto,
    deletePhoto,
    getAllPhotosJSON,
    getPhotoByIdJSON,
    addPhotoJSON,
    deletePhotoJSON
};