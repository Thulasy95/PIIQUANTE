//On importe multer :
const multer = require('multer');

//on crée un dictionnaire de type MIME_TYPES pour traduire le jpg, jpeg en jpg et png en png :
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

//on crée un objet de configuration pour multer qu'on nomme storage et on utilise la fonction diskstorage pour enregistrer sur le disk :
const storage = multer.diskStorage({
    //la fonction destination indique à multer d'enregistrer les fichiers dans le dossier images :
    destination: (req, file, callback) => {
        //argument null indique qu'il n'y a pas eu d'erreur à ce niveau là.
        callback(null, 'images');
    },
    //la fonction filename indique à multer quel nom de fichier on va utiliser :
    filename: (req, file, callback) => {
        //On crée le nom en utilisant le nom d'origine et en remplaçant les espaces par des underscores :
        const name = file.originalname.split(' ').join('_');
        //on va ensuite générer une extension au fichier en accédant à son mimetype et en utilisant le dictionnaire MIME_TYPES :
        const extension = MIME_TYPES[file.mimetype];
        //et on ajoute un timestamp Date.now() pour le rendre le plus unique possible :
        callback(null, name+Date.now()+'.'+extension);
    }
});

//On exporte ensuite l'élément multer entièrement configuré en lui passant notre constante storage 
//et on lui indique qu'on gère uniquement les téléchargements de fichiers image :
module.exports = multer({storage: storage}).single('image');