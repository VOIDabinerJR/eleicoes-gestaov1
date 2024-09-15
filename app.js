const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const multerStorageCloudinary = require('multer-storage-cloudinary');
require('dotenv').config();


// Conexão com o banco de dados
const db = require('./config/db');

// Importação das rotas
const candidatosRouter = require('./routes/candidatos');
const mesasRouter = require('./routes/mesas');
const provinciasRouter = require('./routes/provincias');
const distritosRouter = require('./routes/distritos');
const localidadesRouter = require('./routes/localidades');
const votosRouter = require('./routes/votos');
const relatorioRouter = require('./routes/relatorio');
const linksRouter = require('./routes/links');

// Configurações do Express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuração de arquivos estáticos (CSS, JS, imagens)
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do multer


// Rotas principais
app.use('/candidatos', candidatosRouter);
app.use('/mesas', mesasRouter);
app.use('/provincias', provinciasRouter);
app.use('/distritos', distritosRouter);
app.use('/localidades', localidadesRouter);
app.use('/votos', votosRouter);
app.use('/relatorio', relatorioRouter);
app.use('/links', linksRouter);

// Página inicial
app.get('/', (req, res) => {
    const {token} =req.query;

    if(token=='1234'){
        res.render('index');
    }else if(token=='0000'){
        res.render('admin');
    } else {
        res.render('main');
    }
});

// Rota gerenciamento


// Tratamento de erros (página não encontrada)
app.use((req, res, next) => {
    res.status(404).render('404');
});

//Servir arquivos estáticos (fotos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
