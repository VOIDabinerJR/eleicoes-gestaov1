const jwt = require('jsonwebtoken');
const redis = require('redis');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Configuração da chave secreta
const secretKey = process.env.SECRET_KEY 

const user = { id: 1, username: 'mamau' };

// Configuração do Redis
const redisClient = redis.createClient();

redisClient.on('error', (err) => {
    console.error('Erro no Redis:', err);
});

// Função para criar um token com limite de 20 usos
async function createToken(user) {
    return new Promise((resolve, reject) => {
        const jti = uuidv4(); // ID único para o token
        const payload = { user, jti, usages: 20 };
        const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

        // Armazena no Redis com TTL e contagem de usos
        const expirationTime = 3600; // 1 hora (em segundos)
        redisClient.set(`token:${jti}`, 20, 'EX', expirationTime, (err, reply) => {
            if (err) {
                return reject(err);
            }
            resolve(token);
        });
    });
}

// Função para decodificar e validar o token, e verificar o número de usos
async function decodeToken(token) {
    return new Promise((resolve, reject) => {
        // Verifica o token
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return reject('Token inválido ou expirado');
            }

            const jti = decoded.jti;

            // Verifica o número de usos no Redis
            redisClient.get(`token:${jti}`, (err, usesLeft) => {
                if (err) {
                    return reject(err);
                }

                // Se o token já foi usado 20 vezes ou mais
                if (usesLeft === null || usesLeft <= 0) {
                    return reject('Token excedeu o número de usos permitidos');
                }

                // Decrementa o contador de usos
                redisClient.decr(`token:${jti}`, (err) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(decoded); // Retorna o conteúdo do token
                });
            });
        });
    });
}

// Exemplo de exportação das funções
module.exports = {
    createToken,
    decodeToken
};
