//On importe User, bcrypt et jsonwebtoken :
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//On crée et exporte la fonction créer un compte utilisateur :
exports.signup = (req,res,next) => {

    //fonction pour crypter le mot de passe :
    bcrypt.hash(req.body.password, 10)
    .then( hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save()
        .then(() => {
            console.log('Utilisateur crée !');
            res.status(201).json({message: 'Utilisateur créé !'});
        })
        .catch(error => {
            console.log(error);
            res.status(400).json({ error });
        });
    })
    .catch(error => res.status(500).json({ error }));
};

//On crée et exporte la fonction se connecter :
exports.login = (req,res,next) => {
    //on vérifie que l'e-mail entré par l'utilisateur correspond à un utilisateur existant de la base de données :
    User.findOne({ email: req.body.email })
    .then(user => {
        //S'il n'y a pas l'User :
        if(user === null){
            //on retourne un message :
            return res.status(401).json({ message: 'Email/Mot de passe incorrectes'});
        } else {
            //Si l'user est présent alors on compare le mot de passe entré par l'utilisateur avec le hash enregistré dans la base de données : 
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                //Si les mots de passe ne sont pas valides :
                if(!valid){
                    //On retourne un message :
                    return res.status(401).json({ message:"Email/Mot de passe incorrectes"});
                } else {
                    //Si les mots de passe sont valides :
                    res.status(200).json({
                        //on attribue un id et un token à cette user :
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                }
            })
            //erreur d'éxécution de la requête au serveur :
            .catch(error => res.status(500).json({ error }));
        }
    })
    .catch(error => res.status(500).json({ error }));
};


