const express = require('express')
require('dotenv').config()
const { connect } = require("mongoose")
const cors = require('cors')
const upload = require('express-fileupload')
const path = require('path');
const fs = require('fs');

const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const app = express();

app.use(express.json({ extended: true }))
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://jocular-cat-aea461.netlify.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(upload())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/uploads', (req, res, next) => {
    console.log('Accès fichier:', req.url);
    console.log('Chemin complet:', path.join(__dirname, 'uploads', req.url));
    next();
});

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.use(notFound)
app.use(errorHandler)

connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connexion MongoDB réussie');
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server running on port ${process.env.PORT || 5000}`)
        });
    })
    .catch(error => {
        console.error('Erreur de connexion MongoDB:', error);
        process.exit(1);
    });