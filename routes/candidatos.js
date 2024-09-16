const express = require('express');
const router = express.Router();
const db = require('../config/db');
require('dotenv').config();


    
// Exibir candidatos
router.get('/',async (req, res) => {
    const { token } = req.query;
    try {
        const decoded = await decodeToken(token);

        if (!decoded || !decoded.usages) {
            return res.json({ error: 'hahaha' });
        }

    } catch (error) {
        console.log(error)

    }
    db.query('SELECT * FROM candidatos', (err, rows) => {
        if (err) throw err;
        if(token =='1234'){
            res.render('candidatos/index', { candidatos: rows ,token});
        }else {
            res.render('candidatos/main', { candidatos: rows });
        }
    }); 
});

// Formulário para adicionar candidato

router.get('/novo',async (req, res) => {
    try {
        const decoded = await decodeToken(token);

        if (!decoded || !decoded.usages) {
            return res.json({ error: 'hahaha' });
        }

    } catch (error) {
        console.log(error)

    }
    if( decoded.usages){
        res.render('candidatos/novo');
    }else {
        res.render('candidatos/main');
    }
   
});

// Adicionar candidato
router.post('/novo', async(req, res) => {
    const { nome, partido } = req.body;
    const { token } = req.query;
    try {
        const decoded = await decodeToken(token);

        if (!decoded || !decoded.usages) {
            return res.json({ error: 'hahaha' });
        }

    } catch (error) {
        console.log(error)

    }
    db.query('INSERT INTO candidatos (nome, partido) VALUES (?, ?)', [nome, partido], (err) => {
        if (err) throw err;
        res.redirect('/candidatos');
    });
});

module.exports = router;
