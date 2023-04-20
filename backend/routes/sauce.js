//On importe express, sauceCtrl, auth et multer :
const express = require('express');
const sauceCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

//on crée un routeur Express :
const router = express.Router();

//POST/api/sauces pour créer une sauce :
router.post('/', auth, multer, sauceCtrl.createSauce);

//GET/api/sauces pour afficher toutes les sauces :
router.get('/', auth, sauceCtrl.getAllSauces);

//GET/api/sauces/:id pour afficher une sauce :
router.get('/:id', auth, sauceCtrl.getOneSauce);

//PUT/api/sauces/:id pour modifier une sauce :
router.put('/:id', auth, multer, sauceCtrl.modifySauce);

//DELETE/api/sauces/:id pour supprimer une sauce :
router.delete('/:id', auth, sauceCtrl.deleteSauce);

//POST/api/sauces/:id/like pour aimer une sauce :
router.post('/:id/like', auth, sauceCtrl.likeSauce);

//On exporte router :
module.exports = router;