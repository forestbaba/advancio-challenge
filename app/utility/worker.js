require('dotenv').config();
const { Pool } = require('pg')
const jwt = require('jsonwebtoken');
const { SECRET } = require('./config')

const isProduction = process.env.NODE_ENV === 'production'
console.log('DB props: ', process.env.DB_USER)
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`

const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString
})


const generateToken = (id, name, email) => {
    return jwt.sign({
        id: id,
        name: name,
        email: email
    }, SECRET, { expiresIn: '48h' })
}

const auth = (req, res, next) => {

    if (!req.get("Authorization")) {
        return res.status(401).json({ error: true, message: 'unathourized' })
    } else {

        let token = req.get("Authorization")

        if (token) {

            try {
                const user = jwt.verify(token, SECRET)
                req.user = user
                next()
            } catch (error) {
                throw new Error(error)
            }
        }

    }


}

module.exports = { pool, generateToken, auth }