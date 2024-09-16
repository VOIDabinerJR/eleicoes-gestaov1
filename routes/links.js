const express = require('express');
const router = express.Router();
const db = require('../config/db');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { createToken, decodeToken } = require('../config/tokens');


let decoded = null;
// Formulário para adicionar candidato
router.get('/novo', async (req, res) => {

    //VERIFICA TOKEN ESPECIAL
    const { token, p, d, l, ad } = req.query;

    const queryParams = '?token=' + token + '&p=' + p + '&l=' + l + '&d=' + d;
    const queryParamsAdm = '?token=' + token + '&p=' + p + '&l=' + l + '&d=' + d + '&ad=' + ad;



    try {
        decoded = await decodeToken(token);
        if (!decoded || !decoded.usages) {
            return res.json({ error: 'hahaha' });
        }
console.log(ad)
        if(ad==123 && decoded){
            return res.render('links/novo', { queryParams, queryParamsAdm, display: 'none' }); 

        }



    } catch (error) {
        console.log(error)
        return res.json({ error: 'errr' })
    }

    return res.json({ error: 'err' })

});
router.post('/novo', async (req, res) => {
    //VERIFICA TOKEN ESPECIAL
    const { token, p, d, l, ad } = req.query;

    const queryParams = '?token=' + token + '&p=' + p + '&l=' + l + '&d=' + d;
    const queryParamsAdm = '?token=' + token + '&p=' + p + '&l=' + l + '&d=' + d + '&ad=' + ad;




    try {
        decoded = await decodeToken(token);

        if (decoded) {
            if (!decoded) {
                //if(0!=0 || !tokenisValid()){
                return res.json({ error: 'hahaha' })
            }
            const tokeny = await createToken();

            return res.render('links/novo', { queryParams, queryParamsAdm, display: 'block' });

        } else {
            return res.json({ error: 'hahaha' })
        }


    } catch (error) {
        console.log(error)

    }
});



module.exports = router;
