const express = require('express')
const router = express.Router()
const { auth, pool } = require('../../utility/worker')


router.get('/', (req, res) => {

    pool.query(`SELECT * FROM comments JOIN users ON comments.userid= users.id 
`,
        (err, results) => {
            if (err) {
                throw err;
            } else {
                return res.status(200).json({ error: false, comments: results.rows })
            }
        })


})
router.get('/:commentId', (req, res) => {

    if (isNaN(req.params.commentId)) {
        return res.status(400).json({error: true, message:'invalid arguement'});
    }
    pool.query(`SELECT * FROM comment_replies  JOIN users ON comment_replies.userid= users.id where comment_id=$1 
`, [req.params.commentId],
        (err, results) => {
            if (err) {
                throw err;
            } else {
                return res.status(200).json({ error: false, comments: results.rows })
            }
        })


})

router.post('/', auth, (req, res) => {
    if (!req.body.comment || req.body.comment.trim() === '') {
        return res.status(400).json({ error: true, message: 'comment can not be empty' })
    } else {
        pool.query(`INSERT INTO comments (userId, comment, createdAt, updatedAt)
                VALUES($1, $2, $3, $4)
                RETURNING id, comment,userId, createdAt, updatedAt`,
            [req.user.id, req.body.comment, new Date, new Date], (err, results) => {
                if (err) {
                    throw err;
                } else {
                    return res.status(200).json({ error: false, message: 'comment added successfully', comments: results.rows[0] })
                }
            })
    }

})
router.post('/reply/:commentId', auth, (req, res) => {
    if (!req.params.commentId) {
        return res.status(400).json({ error: true, message: 'commentId is required' })
    }
    if (!req.body.commentReply || req.body.commentReply.trim() === '') {
        return res.status(400).json({ error: true, message: 'comment reply can not be empty' })
    }

    pool.query(`SELECT * from comments where id = $1`, [req.params.commentId], (error, results) => {

        if (!results.rows.length) {
            return res.status(400).json({ error: true, message: 'comment not found' })
        } else {
            pool.query(`INSERT INTO comment_replies (userId,comment_id, comment_reply, createdAt, updatedAt)
                VALUES($1, $2, $3, $4, $5)
                RETURNING id, comment_id, comment_reply,userId, createdAt, updatedAt`,
                [req.user.id, req.params.commentId, req.body.commentReply, new Date, new Date], (err, results) => {
                    if (err) {
                        throw err;
                    } else {
                        return res.status(200).json({ error: false, message: 'reply added successfully', comments: results.rows[0] })
                    }
                })
        }
    })

})

router.patch('/:commentId', auth, (req, res) => {
    if (!req.params.commentId) {
        return res.status(400).json({ error: true, message: 'commentId is required' })
    }
    if (!req.body.comment || req.body.comment.trim() === '') {
        return res.status(400).json({ error: true, message: 'comment can not be empty' })
    }

    pool.query(`SELECT * from comments where id = $1`, [req.params.commentId], (error, results) => {

        if (!results.rows.length) {
            return res.status(400).json({ error: true, message: 'comment not found' })
        } else {



            if (results.rows[0].userid !== parseInt(req.user.id)) {
                return res.status(401).json({ error: true, message: 'You are not allowed to update comment' })
            } else {
                pool.query(`UPDATE comments SET comment = $1, updatedat = $2 where id = $3
                RETURNING id, comment,  createdat, updatedat`,
                    [req.body.comment, new Date, req.params.commentId], (err, results) => {
                        if (err) {
                            console.log('ERR: ', err.message)
                            throw err;
                        } else {
                            return res.status(200).json({ error: false, message: 'reply added successfully', comments: results.rows[0] })
                        }
                    })
            }
        }
    })

})

router.delete('/:commentId', auth, (req, res) => {
    console.log('========', req.params.commentId)
    if (!req.params.commentId) {
        return res.status(400).json({ error: true, message: 'commentId is required' })
    }

    pool.query(`SELECT * from comments where id = $1`, [req.params.commentId], (error, results) => {

        if (!results.rows.length) {
            return res.status(400).json({ error: true, message: 'comment not found' })
        } else {



            if (results.rows[0].userid !== parseInt(req.user.id)) {
                return res.status(401).json({ error: true, message: 'You are not allowed to delete this comment' })
            } else {
                pool.query(`DELETE FROM comments WHERE id = $1`,
                    [req.params.commentId], (err, results) => {
                        if (err) {
                            console.log('ERR: ', err.message)
                            throw err;
                        } else {
                            return res.status(200).json({ error: false, message: 'comment deleted' })
                        }
                    })
            }
        }
    })

})



module.exports = router;