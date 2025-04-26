const express = require('express');
const router = express.Router();

const {
    getAllPhotos,
    getPhotoById,
    addPhoto,
    deletePhoto,
} = require('../controllers/photosController');

router.get('/', getAllPhotos);
router.get('/:id', getPhotoById);
router.post('/', addPhoto);
// router.put('/:id', updatePhoto); // probably doesn't make sense for photos in a database
router.delete('/:id', deletePhoto);

module.exports = router;