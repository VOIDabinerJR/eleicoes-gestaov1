const express = require('express');
const router = express.Router();
const db = require('../config/db');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { createToken, decodeToken } = require('../config/tokens');



// Formulário para adicionar candidato
router.get('/novo', (req, res) => {
    //VERIFICA TOKEN ESPECIAL
   

    const user = { id: 1, username: 'mamau' };

    ///depois
    const token = createToken()
    console.log(token)

    if (process.env.SECRET_KEY === req.query) {

        res.render('links/novo', { link: token || '' });
    } else {
        res.render('links/novo', { link: token || '' });
    }

});
router.post('/novo', async (req, res)  => {
    //VERIFICA TOKEN ESPECIAL
    const secretKey = process.env.SECRET_KEY

    const user = { id: 1, username: 'mamau' };

    ///depois
    async function createNewToken() {
        try {
            const token = await createToken({ id: 1, username: 'user123' });
            console.log('Token criado:', token);
        } catch (err) {
            console.error('Erro ao criar token:', err);
        }
    }
    const token =  createNewToken(); 
    

    if (process.env.SECRET_KEY === req.query) {

        res.render('links/novo', { link: token || '' });
    } else {
        res.render('links/novo', { link: token || '' });
    }

});



module.exports = router;
