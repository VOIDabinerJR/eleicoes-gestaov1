const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { createToken, decodeToken } = require('../config/tokens');
require('dotenv').config();
let decoded =null;

    
// Exibir candidatos
router.get('/',async (req, res) => {
    const { token,p,d,l } = req.query;
   
    const queryParams = '?token='+ token +'&p='+p+'&l='+l+'&d='+d;
    try {
         decoded = await decodeToken(token);

        if (!decoded || !decoded.usages) {
            return res.json({ error: 'hahaha' });
        } 
        console.log(decoded) 

    } catch (error) {
        console.log(error)

    }
    db.query('SELECT * FROM candidatos', (err, rows) => {
        if (err) throw err;
        if(decoded){
            res.render('candidatos/index', { candidatos: rows ,queryParams});
        }else { 
            res.render('candidatos/main', { candidatos: rows });
        }
    }); 
});

// Formulário para adicionar candidato

router.get('/novo',async (req, res) => {
    const { token,p,d,l } = req.query;
    
    const queryParams = '?token='+ token +'&p='+p+'&l='+l+'&d='+d;
    try {
         decoded = await decodeToken(token);

        if (!decoded || !decoded.usages) {
            return res.json({ error: 'hahaha' });
        }

    } catch (error) {
        console.log(error)

    }
    if( decoded){ 
        res.render('candidatos/novo',{queryParams});
    }else {
        res.render('main'); 
    }
   
});

// Adicionar candidato
router.post('/novo', async(req, res) => {
    const { nome, partido } = req.body;
    const { token,p,d,l } = req.query;
   
    const queryParams = '?token='+ token +'&p='+p+'&l='+l+'&d='+d;
    try {
         decoded = await decodeToken(token);

        if (!decoded || !decoded.usages) {
            return res.json({ error: 'hahaha' });
        }

    } catch (error) {
        console.log(error)

    }
    db.query('INSERT INTO candidatos (nome, partido) VALUES (?, ?)', [nome, partido], (err) => {
        if (err) throw err;
        res.redirect(`/candidatos${queryParams}`);
    });
});

module.exports = router;
