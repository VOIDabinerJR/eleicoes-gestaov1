const express = require('express');
const router = express.Router();
const db = require('../config/db');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { createToken, decodeToken } = require('../config/tokens');



// Formulário para adicionar candidato
router.get('/novo', async(req, res) => {

    //VERIFICA TOKEN ESPECIAL
    const { token } = req.query;
    

   try {
     decoded = await decodeToken(token);
     
    
   
   if(decoded){
    if (decoded.exp < 1726449020) {
        //if(0!=0 || !tokenisValid()){
        return res.json({ error: 'hahaha' })
    }
    

    return res.render('links/novo', { token:token ,display: 'none'});

   } else {
    return res.json({ error: 'hahaha' })
   }

    
} catch (error) {
    console.log(error)
    
   }

    

});
router.post('/novo', async (req, res) => {
    const { token } = req.query;  
    

   
    try {
        decoded = await decodeToken(token);
      
      if(decoded){
       if (!decoded.usages) {
           //if(0!=0 || !tokenisValid()){
           return res.json({ error: 'hahaha' })
       }
       const tokeny = await createToken();
   
       return res.render('links/novo', { token:tokeny ,display: 'block'});
   
      } else {
       return res.json({ error: 'hahaha' })
      }
   
       
   } catch (error) {
       console.log(error)
       
      }
});



module.exports = router;
