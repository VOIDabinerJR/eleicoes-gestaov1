const express = require('express');
const router = express.Router();
const db = require('../config/db');
require('dotenv').config();


    
// Exibir candidatos
router.get('/', (req, res) => {
    const { token } = req.query;
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

router.get('/novo', (req, res) => {
    if( token =='1234'){
        res.render('candidatos/novo');
    }else {
        res.render('candidatos/main');
    }
   
});

// Adicionar candidato
router.post('/novo', (req, res) => {
    const { nome, partido } = req.body;
    const { token } = req.query;
    if (token != '1234') {
        //if(0!=0 || !tokenisValid()){
        return res.json({ error: 'hahaha' })
    }
    db.query('INSERT INTO candidatos (nome, partido) VALUES (?, ?)', [nome, partido], (err) => {
        if (err) throw err;
        res.redirect('/candidatos');
    });
});

module.exports = router;
