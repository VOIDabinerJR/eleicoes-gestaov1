const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const multerStorageCloudinary = require('multer-storage-cloudinary');
const path = require('path');
const db = require('../config/db');
const { createToken, decodeToken } = require('../config/tokens');
let decoded =null;

const storage = multer.diskStorage({
    destination: function (req, file, cb) { 
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Configuração do Cloudinary
//cloudinary.config({
// cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//api_key: process.env.CLOUDINARY_API_KEY,
//api_secret: process.env.CLOUDINARY_API_SECRET
//});

// Configuração do multer-storage-cloudinary
//const storage = multerStorageCloudinary({
//cloudinary: cloudinary,
//folder: 'your-folder-name',
//  allowedFormats: ['jpg', 'jpeg', 'png', 'gif']
//});



const upload = multer({ storage: storage });

// Exibir votos
router.get('/:mesa_id', async (req, res) => {
    const { token, p, d, l } = req.query;
    const queryParams = '?token=' + token + '&p=' + p + '&l=' + l + '&d=' + d;

    try {

        try {
             decoded = await decodeToken(token);
    
            if (!decoded || !decoded.usages ||decoded ==null) {
                return res.json({ error: 'hahaha' });
            }
    
        } catch (error) {
            console.log(error)
    
        }

        let totalVotos = 0;
        const { mesa_id } = req.params;

        db.query('SELECT * FROM atas where mesa_id = ?', [mesa_id], (err, atas) => {


            if (err) throw err;


            db.query('SELECT * FROM votos WHERE mesa_id = ?', [mesa_id], (err, rows) => {
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
                            res.render('votos/index', { atas: atas, mesa_id, votos: aggregatedVotesArray, totalVotos, EleitoresRegistados: 20000, queryParams });
                        } else {
                            res.render('votos/main', { atas: atas, mesa_id, votos: aggregatedVotesArray, totalVotos, EleitoresRegistados: 20000 });
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








// Exibir votos detalhados
router.get('/:id/detalhes', async (req, res) => {
    const { id } = req.params;
    const { token, p, d, l } = req.query;
    const queryParams = '?token=' + token + '&p=' + p + '&l=' + l + '&d=' + d;
    let atas = null;
    let totalVotos = 0;
    let fotoUrl = null

    
    db.query('SELECT * FROM atas where id = ?', [id], (err, atas) => {


        if (err) throw err;

        fotoUrl = atas[0].foto_url;
    });

    db.query('SELECT * FROM votos WHERE ata_id = ?', [id], (err, rows) => {
        if (err) throw err;

        if (rows.length > 0) {
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
                    });

                    if (decoded) {
                        res.render('votos/detalhes', { atas: atas, votos: votosComNomes, totalVotos, fotoUrl, EleitoresRegistados: 20000 });
                    } else {
                        res.render('votos/detalhes2', { atas: atas, votos: votosComNomes, totalVotos, fotoUrl, EleitoresRegistados: 20000 });
                    }
                })
                .catch(err => {
                    console.error('Erro ao recuperar nomes dos candidatos:', err);
                    res.status(500).send('Erro ao recuperar nomes dos candidatos');
                });
        } else {
            res.render('votos/detalhes', { votos: [], mesa_id: 0 });
        }
    });
});

//   
router.get('/:mesa_id/novo', async (req, res) => {
    const { mesa_id } = req.params;
    const { token, p, d, l } = req.query;
    const queryParams = '?token=' + token + '&p=' + p + '&l=' + l + '&d=' + d;

    try {
         decoded = await decodeToken(token);

        if (!decoded || !decoded.usages ||decoded ==null) {
            return res.json({ error: 'hahaha' });
        }

    } catch (error) {
        console.log(error)

    }

    db.query('SELECT * FROM candidatos ', [mesa_id], (err, rows) => {
        if (err) throw err;

        res.render('votos/novo', { candidatos: rows, mesa_id, queryParams });
    });

});


router.post('/:mesa_id/novo', upload.single('foto'),async (req, res) => {
    const { foto_url } = req.body;
    const { candidatos } = req.body;
    const { mesa_id } = req.params;
    const { token, p, d, l } = req.query;
    const queryParams = '?token=' + token + '&p=' + p + '&l=' + l + '&d=' + d;

    console.log(req.query);
    console.log('a')
    let totalVotos = 0;
    let insertId = 0;

    try {
         decoded = await decodeToken(token);

        if (!decoded || !decoded.usages ||decoded ==null) {
            return res.json({ error: 'hahaha' });
        }

    } catch (error) {
        console.log(error)

    }

    console.log(req.body)

    if (candidatos) {
        candidatos.forEach(candidato => {
            const { votos, id } = candidato;
            if (id != 'null' && id != null) {
                totalVotos = totalVotos + parseInt(votos)

            } 
        });   
    }

    db.query('INSERT INTO atas (mesa_id, quantidade_votos, foto_url) VALUES (?, ?, ?)',
        [mesa_id, totalVotos, foto_url], (err, results) => {
            if (err) throw err;
            let ataId = results.insertId;

            if (candidatos) {
                candidatos.forEach(candidato => {
                    const { id, votos } = candidato;
                    if (id != 'null' && id != null) {
                        db.query('INSERT INTO votos (mesa_id, ata_id ,candidato_id, quantidade_votos,localidade_id,distrito_id,provincia_id) VALUES (?, ?, ?, ?,?,?,?)',
                            [mesa_id, parseInt(ataId), id, votos, l, d, p], (err) => {
                                if (err) throw err;
                            });
                    }

                });
            }

        });




    res.redirect(`/votos/${mesa_id}${queryParams}`);
});

module.exports = router;
