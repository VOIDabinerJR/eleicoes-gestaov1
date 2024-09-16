const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { createToken, decodeToken } = require('../config/tokens');
let decoded =null;


// Exibir províncias
router.get('/', async(req, res) => {


    const { token,p,d,l } = req.query;
    const queryParams = '?token='+ token +'&p='+p+'&l='+l+'&d='+d;
    console.log(req.query)

    let provincias = {};
    let aggregatedVotesArray = {};


    try { 
        let totalVotos = 0;
        try {
            console.log(decoded)
            decoded = await decodeToken(token);
            console.log(decoded)
    
            if (!decoded || !decoded.usages) {
                return res.json({ error: 'hahaha' });
            }
    
        } catch (error) {
            console.log(error)
    
        }


        db.query('SELECT * FROM provincias', (err, provincias) => {



            if (err) throw err;


            db.query('SELECT * FROM votos ', (err, rows) => {
                if (err) throw err;


                // Cria um array de Promises para consultar os nomes dos candidatos
                const nomePromises = rows.map(voto => {
                    return new Promise((resolve, reject) => {
                        db.query('SELECT nome FROM candidatos WHERE id = ?', [voto.candidato_id], (err, result) => {
                            if (err) return reject(err);
                            resolve({ ...voto, candidato_nome: result[0].nome });
                        });
                    });
                });
                Promise.all(nomePromises)
                    .then(votosComNomes => {
                        votosComNomes.forEach(candidato => {
                            const { quantidade_votos, id } = candidato;
                            if (id !== 'null' && id !== null) {
                                totalVotos += parseInt(quantidade_votos, 10);
                            }
                        });
                        votosComNomes = votosComNomes.map(candidato => {
                            const { quantidade_votos } = candidato;
                            const percentagem = (quantidade_votos / totalVotos) * 100;

                            return {
                                ...candidato,
                                percentagem: percentagem.toFixed(2) // Limita a percentagem a 2 casas decimais
                            };
                        });// Aggregate votes
                        const aggregatedVotes = votosComNomes.reduce((acc, voto) => {
                            if (!acc[voto.candidato_nome]) {
                                acc[voto.candidato_nome] = { ...voto };
                            } else {
                                acc[voto.candidato_nome].quantidade_votos += voto.quantidade_votos;
                                acc[voto.candidato_nome].percentagem = (acc[voto.candidato_nome].quantidade_votos / totalVotos) * 100; // Update percentage if needed
                            }
                            return acc;
                        }, {});
                        const aggregatedVotesArray = Object.values(aggregatedVotes);


 
                        if (decoded) {
                            
                            //if (0 != 0 || token.isValid()) {
                            res.render(`provincias/index`, { provincias: provincias, votos: aggregatedVotesArray, totalVotos, EleitoresRegistados: 20000, fotoUrl: '', queryParams });
                        } else {
                            res.render('provincias/main', { provincias: provincias, votos: aggregatedVotesArray, totalVotos, EleitoresRegistados: 20000, fotoUrl: '' });
                        }
                        //  res.render('votos/detalhes2', { votos: votosComNomes, totalVotos, fotoUrl, EleitoresRegistados: 20000 });
                    })
                    .catch(err => {
                        console.error('Erro ao recuperar nomes dos candidatos:', err);
                        res.status(500).send('Erro ao recuperar nomes dos candidatos');
                    });

            });



        });
    } catch (error) {
        console.log(error)
    }
});

// Formulário para adicionar província
router.get('/novo',async (req, res) => {
    const { token,p,d,l } = req.query;
    const queryParams = '?token='+ token +'&p='+p+'&l='+l+'&d='+d;
    try {
        const decoded = await decodeToken(token);

        if (!decoded || !decoded.usages ||decoded ==null) {
            return res.json({ error: 'hahaha' });
        }

    } catch (error) {
        console.log(error)

    }
    res.render(`provincias/novo`, { queryParams });
});

// Adicionar província
router.post('/novo',async (req, res) => {
    const { token,p,d,l } = req.query;
    const queryParams = '?token='+ token +'&p='+p+'&l='+l+'&d='+d;
    const { nome } = req.body;
    console.log(req.url)

    try {
        const decoded = await decodeToken(token);

        if (!decoded || !decoded.usages ||decoded ==null) {
            return res.json({ error: 'hahaha' });
        }

    } catch (error) {
        console.log(error)

    }
    db.query('INSERT INTO provincias (nome) VALUES (?)', [nome], (err) => {
        if (err) throw err;
        res.redirect(`/provincias${queryParams}`);
    });
});

module.exports = router;
