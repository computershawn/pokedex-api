/*
    This is our server application
    More description here...
*/

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet')
const cors = require('cors');
const POKEDEX = require('./pokedex.json');


const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
const app = express()
app.use(morgan(morganSetting))
app.use(cors());
app.use(helmet());

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`]

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    const authToken = req.get('Authorization');

    if(!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' })
    }
    // move to the next middlware
    next();
})

app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production') {
      response = { error: { message: 'server error' }}
    } else {
      response = { error }
    }
    res.status(500).json(response)
})

function handleGetTypes(req, res) {
    res.json(validTypes);
}

app.get('/types', handleGetTypes)

function handleGetPokemon(req, res) {
    const { name = "", type = "" } = req.query;

    if(type && !validTypes.includes(type)) {
        return res.status(400).json({ Error: 'Please specify a valid type of Pokemon.' })
    }

    let results = POKEDEX.pokemon;
    if(name) {
        results = results.filter(pokemonItem => 
            pokemonItem.name.toLowerCase().includes(name.toLowerCase())
        );
    };

    if(type) {
        results = results.filter(pokemonItem => 
            pokemonItem.type.includes(type)
        );        
    }
    
    if(results) {
        res.json(results);
    } else {
        res.json("No Pokemon Found");
    }
}

app.get('/pokemon', handleGetPokemon);

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    //console.log(`Server listening at http://localhost:${PORT}`)
})