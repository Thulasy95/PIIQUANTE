//On importe express, mongoose, sauceRoutes, userRoutes, path : 
const express = require('express');
const mongoose = require('mongoose');
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const path = require('path'); //pour accéder au chemin de notre serveur.

//Connection à Mongoose :
mongoose.connect('mongodb+srv://thulasy95:OpenclassR00msP6@cluster0.vptynpt.mongodb.net/?retryWrites=true&w=majority',
{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

//On créé une application app en appelant la méthode express():
const app = express();

//Pour accéder aux corps de la requête POST (analyse le corps de la requête, et le formate pour en faciliter l'exploitation):
app.use(express.json());

//Middleware générale appliqué à toutes les requêtes du serveur / CORS :
app.use((req, res, next) => {
    //accéder à notre API depuis n'importe quelle origine '*' localhost:3000 et 4200 :
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

//Pour cette route, on utilise le router qui est exposé par sauceRoutes :
app.use('/api/sauces', sauceRoutes);
//idem pour userRoutes :
app.use('/api/auth', userRoutes);
//Pour qu'Express gère la ressource images de manière statique (un sous-répertoire de notre répertoire de base(:'__dirname')) à chaque fois qu'elle reçoit une requête vers la route '/images':
app.use('/images',express.static(path.join(__dirname,'images')));

//Pour exporter cette application express et l'utiliser dans d'autre fichier :
module.exports = app;
