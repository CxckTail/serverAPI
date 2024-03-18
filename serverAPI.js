const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = 3000;
const secretKey = process.env.SECRET_JWT;

app.use(express.json());

app.use(session({
    secret: process.env.SECRET_JWT,
    resave: false,
    saveUninitialized: true
}));

const voitures = [
    { marque: "Toyota", modele: "Corolla", annee: 2020 },
    { marque: "Honda", modele: "Civic", annee: 2019 },
    { marque: "Ford", modele: "Mustang", annee: 2021 },
    { marque: "BMW", modele: "X5", annee: 2018 },
    { marque: "Mercedes-Benz", modele: "C-Class", annee: 2022 }
];

const users = [
    { id: 1, username: 'user1', password: 'password1' },
    { id: 2, username: 'user2', password: 'password2' },
];

const requireAuthJWT = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token.split(' ')[1], secretKey, (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ error: 'Unauthorized' });
            } else {
                req.user = decodedToken;
                next();
            }
        });
    } else {
        return res.status(401).json({ error: 'Unauthorized' });
    }
};


const requireAuthSession = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        req.session.user = { id: user.id, username: user.username };
        const token = jwt.sign({ username: user.username, id: user.id }, secretKey);
        res.json({ token });
    } else {
        res.status(401).json({ error: "Vous n'êtes pas autorisé à accéder à cette ressource" });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.status(500).json({ error: 'Erreur lors de la déconnexion' });
        } else {
            res.clearCookie('connect.sid').json({ message: 'Déconnecté avec succès' });
        }
    });
});

app.get('/Marques', requireAuthJWT, (req, res) => {
    const marques = voitures.map(voiture => voiture.marque);
    res.json({ marques });
});

app.get('/Modeles', requireAuthSession, (req, res) => {
    const modeles = voitures.map(voiture => voiture.modele);
    res.json({ modeles });
});

app.get("/", requireAuthSession, (req, res) => {
    res.json({ message: "Information du compte", user: req.session.user });
})

app.listen(PORT, () => {
    console.log(`Serveur lancé sur le port : ${PORT}`);
});
