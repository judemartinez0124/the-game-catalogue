const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Game = require('./models/game');
const ejsMate = require('ejs-mate');
const flash = require('connect-flash');
const session = require('express-session');

mongoose.connect('mongodb://localhost:27017/gamelist');

const db = mongoose.connection;
db.on("error",console.error.bind(console,"connection error:"));
db.once("open",() =>{
    console.log("Database connected");
});

const app = express();

const platforms = ['PC', 'Playstation', 'Xbox', 'Switch'];
const genres = ['Action', 'Adventure', 'Horror', 'Fighting', 'Survival', 'Story'];

app.engine('ejs',ejsMate);
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

const sessionConfig = {
    secret: 'games',
    resave: false,
    saveUnitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig));

app.use(flash());

app.use((req, res, next) =>{
    res.locals.success = req.flash('success');
    next();
})

app.get('/', async (req,res) => {
    res.render('games/landing');
});

app.get('/games', async (req,res) => {
    const game = await Game.findById(req.params.id);
    const {genre,platform} = req.query;
    if(genre) {
        const games = await Game.find({genre});
        res.render('games/home', {games,game,platforms,genres});
    }
    else if(platform) {
        const games = await Game.find({platform});
        res.render('games/home', {games,game,platforms,genres});
    } else {
        const games = await Game.find({});
        res.render('games/home', {games,game,platforms,genres});
    }
});

app.get('/games/new',(req,res) => {
    res.render('games/new', {platforms,genres});
});
app.post('/games', async(req,res) => {
    const game = new Game(req.body.game);
    await game.save();
    req.flash('success', 'Successfully added a game');
    res.redirect(`/games/${game._id}`);
});

app.get('/games/:id', async(req,res) => {
    const game = await Game.findById(req.params.id)
    res.render('games/show', {game})
});

app.get('/games/:id/edit', async(req,res) => {
    const game = await Game.findById(req.params.id)
    res.render('games/edit', {game,platforms,genres})
});
app.put('/games/:id', async(req,res) => {
    const {id} =  req.params;
    const game = await Game.findByIdAndUpdate(id,{...req.body.game})
    req.flash('success', 'Successfully updated game')
    res.redirect(`/games/${game._id}`)
});

app.delete('/games/:id', async(req,res) => {
    const {id} =  req.params;
    await Game.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted game');
    res.redirect('/games');
}); 

app.listen(3000,() => {
    console.log('Serving on port 3000')
});