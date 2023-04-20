//On importe jsonwebtoken :
const jwt = require('jsonwebtoken');

//On exporte la fonction suivante :
module.exports = (req, res, next) => {
    try{

        //On récupère le token du débugger DevTools ("onglet Network/Headers/Authorization : Bearer TOKEN") 
        //et on le split dans un tableau séparé par l'espace car on n'a pas pas besoin du Bearer et on prend seulement la 2ème partie :
        const token = req.headers.authorization.split(' ')[1];

        //puis on vérifie que c'est le même token que celui qu'on attribué à l'utilisateur lors du login :
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');

        //enfin on récupère l'ID utilisateur de notre token et on le rajoute à l’objet Request afin que nos différentes routes puissent l’exploiter :
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        };

        next();

    } catch(error) {

        //Sinon on revoie une erreur 403-unauthorized request : 
        res.status(403).json({ error });
        
    }
};