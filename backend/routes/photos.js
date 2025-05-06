import { Router } from 'express';
import multer from 'multer';
const router = Router();
const upload = multer();

import { getAllPhotos, getPhotoById, addPhoto, deletePhoto } from '../controllers/photosController';

router.get('/', getAllPhotos);
router.get('/:id', getPhotoById);
router.post('/', upload.single("image"), addPhoto);
router.delete('/:id', deletePhoto);
// router.put('/:id', updatePhoto); // probably doesn't make sense for photos in a database


export default router;