//On importe express et userCtrl :
const express = require('express');
const userCtrl = require('../controllers/user');

//on crée un routeur Express :
const router = express.Router();

//POST/api/ pour créer un compte utilisateur :
router.post('/signup', userCtrl.signup);

//POST/api/sauces/:id/like pour se connecter :
router.post('/login', userCtrl.login);

//On exporte router :
module.exports = router;