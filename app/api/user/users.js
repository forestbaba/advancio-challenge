const express = require('express');
const bcrypt = require('bcryptjs');
const { pool, generateToken } = require('../../utility/worker');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../../utility/config')
const router = express.Router()


router.post('/signup', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({ error: true, message: 'Please fill all required fields' })
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ error: true, message: 'password do not match' })
    }

    let hashedPassword = await bcrypt.hash(password, 10);
    pool.query(`
    SELECT * FROM users WHERE email = $1`, [email], (err, results) => {
        if (err) {
            console.log('ERR: ', err.message)
            throw err
        }
        if (results.rows.length > 0) {
            return res.status(400).json({ error: true, message: 'Email already exists' })
        } else {
            pool.query(`INSERT INTO users (name, email, password, createdat)
                VALUES($1, $2, $3, $4)
                RETURNING id, password`, [name, email, hashedPassword, new Date], (err, results) => {
                if (err) {
                    throw err
                } else {
                    const token = generateToken(results.rows[0].id, results.rows[0].name, results.rows[0].email)
                    return res.status(200).json({ error: false, message: 'Signup successful', user: results.rows, token: token })
                }
            })
        }
    })

})

router.post('/login', (req, res) => { 
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: true, message: 'email and password is required' })
    } else {
        pool.query(`SELECT * FROM users where email = $1`, [email], (err, results) => {
            if (err) {
                throw err
            }
            if (results.rows.length > 0) {
                const user = results.rows[0]

                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        throw err
                    }
                    if (isMatch) {
                        const token = generateToken(results.rows[0].id, results.rows[0].name, results.rows[0].email)
                        return res.status(200).json({ error: false, user: { id: results.rows[0].id, email: results.rows[0].email, name:results.rows[0].name, token} })
                    } else {
                        return res.status(400).json({ error: true, message: 'Either email or password is incorrect' })
                    }
                })
            }
        })
    }
})

module.exports = router;