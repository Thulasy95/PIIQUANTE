//On importe Sauce et fs(:file system) :
const Sauce = require('../models/Sauce');
const fs = require('fs'); //il nous donne accès aux fonctions qui nous permettent de modifier le système de fichiers, y compris aux fonctions permettant de supprimer les fichiers.

//On crée et exporte la fonction créer une sauce :
exports.createSauce = (req,res,next) => {

    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    //on supprime _userId afin d’éviter de changer son propriétaire : 
    delete sauceObject._userId;

    const sauce = new Sauce({

        ...sauceObject,
        //et on remplace le userId par celui du token :
        userId: req.auth.userId,
        //imageUrl: 'http://localhost:3000/images/<image_name>.jpg/png' :
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        //on initialise likes et dislikes à 0 :
        likes: 0,
        dislikes: 0,
        //et les usersLiked et usersDisliked avec des tableaux vides :
        usersLiked: [],
        usersDisliked: [],
        
    });

    sauce.save()
    .then(() => res.status(201).json({message: 'Votre sauce a été enregistrée.'}))
    .catch(error => res.status(400).json({ error}));

};

//On crée et exporte la fonction afficher les sauces :
exports.getAllSauces = (req,res,next) => {
    
    //renvoie un tableau de toutes les sauces de la base de donnée :
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({error}));

};

//On crée et exporte la fonction pour afficher une sauce :
exports.getOneSauce = (req,res,next)=> {

    Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({error}));

};

//On crée et exporte la fonction pour modifier une sauce :
exports.modifySauce = (req, res, next)=>{

    //Si il y a un champ file dans l'objet sauce (si l'utilisateur a mise à jour l'image ou pas) :
    const sauceObject = req.file ? {

        //si il y en a, alors on récupère l'objet sauce en parsant la chaine de caractère
        ...JSON.parse(req.body.sauce),
        //et on traite l'image (imageUrl:'http://localhost:3000/images/<image_name>.jpg/png') :
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`

    } : {
        
        //Si il n'y en a pas, alors on récupère juste les donées JSON de la requète.
        ...req.body
    
    };

    //On supprime _userId afin d'éviter de changer son propriétaire :
    delete sauceObject._userId;

    //on récupère la sauce avec l'id :
    Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {

        //Si l'id du propriètaire de la sauce est différent de celui du token :
        if(sauce.userId != req.auth.userId){
            
            //Alors on affiche un message :
            res.status(403).json({ message: 'Non autorisée !'});

        } else {

            //Sinon on modifie la sauce avec les données de la requête :
            Sauce.updateOne({ _id: req.params.id}, {...sauceObject, _id: req.params.id})
            .then(() => res.status(200).json({ message: 'Votre sauce a été modifiée.'}))
            .catch(error => res.status(403).json({ error }));

        }
    })
    .catch(error => res.status(400).json({error}));

};

//On crée et exporte la fonction pour supprimer une sauce :
exports.deleteSauce = (req,res,next)=> {

    //On récupère la sauce avec l'id :
    Sauce.findOne({ _id: req.params.id })
    .then( sauce => {

        //Si l'id du propriètaire de la sauce est différent de celui du token :
        if(req.auth.userId != sauce.userId){

            //Alors on supprime :
            res.status(403).json({ message: 'Non autorisée !'});

        } else {

            //Sinon on récupère le nom du fichier :
            const filename = sauce.imageUrl.split('/images/')[1];
            //on supprime ce fichier dans le dossier images :
            fs.unlink(`images/${filename}`, () => {

                // et on supprime la sauce :
                Sauce.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({message: 'Votre sauce a été supprimée.'}))
                .catch(error => res.status(400).json({error}));

            });

        }

    })
    .catch(error => res.status(500).json({ error }));

};

//On crée et exporte la fonction pour aimer une sauce :
exports.likeSauce = (req,res,next) => {

    //On récupère le statut de like, l'userId de l'utilisateur qui aime ou pas la sauce :
    const like = req.body.like;
    const userIdOfLiker = req.body.userId;

    switch(like){

        //si l'utilisateur a aimé la sauce :
        case 1:
            
            //Alors on ajoute 1 à likes et l'userId dans usersLiked :
            Sauce.updateOne({_id: req.params.id}, {$inc:{likes:+1}, $push:{usersLiked:userIdOfLiker}})
            .then(() => res.status(200).json({message:"Vous avez aimé cette sauce."}))
            .catch( error => res.status(400).json({ error }));
            break;
        
        //si l'utilisateur n'a pas aimé la sauce :
        case -1:

            //Alors on ajoute 1 à dislikes et l'userId dans usersDisliked :
            Sauce.updateOne({_id: req.params.id}, {$inc:{dislikes:+1}, $push:{usersDisliked:userIdOfLiker}})
            .then(() => res.status(200).json({message:"Vous n'avez pas aimé cette sauce."}))
            .catch( error => res.status(400).json({ error }));
            break;

        //si l'utilisateur a annulé son like ou son dislike :
        case 0:

            //On récupère les valeurs de la sauce avec l'id :
            Sauce.findOne({ _id: req.params.id })
            .then( sauce => {

                //Si l'userIdOfLiker est déjà dans le tableau usersliked
                if(sauce.usersLiked.includes(userIdOfLiker)){

                    //Alors on enlève 1 à likes et l'userId dans usersLiked :
                    Sauce.updateOne({_id: req.params.id},{$inc:{likes:-1}, $pull: {usersLiked:userIdOfLiker}})
                    .then(() => res.status(200).json({message:'Vous avez annulé votre Like !'}))
                    .catch( error => res.status(400).json({ error }));

                }

                //Si l'userIdOfLiker est déjà dans le tableau usersdisliked
                if(sauce.usersDisliked.includes(userIdOfLiker)){
                    
                    //Alors on enlève 1 à dislikes et l'userId dans usersDisliked :
                    Sauce.updateOne({_id: req.params.id},{$inc:{dislikes:-1}, $pull: {usersDisliked:userIdOfLiker}})
                    .then(() => res.status(200).json({message:'Vous avez annulé votre Dislike !'}))
                    .catch( error => res.status(400).json({ error }));

                }

            })
            .catch(error => res.status(500).json({ error }));
            break;

        default:
            console.log(error);

    }        
};
