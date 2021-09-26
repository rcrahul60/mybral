const express = require('express')
const route = express.Router()
const Author = require('../models/author')

//all author routes

route.get('/', async (req, res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
        // console.log(searchOptions)
    }
    try {
        const authors = await Author.find(searchOptions)
        //console.log(authors)
        res.render('authors/index', { authors: authors, searchOptions: req.query })
    } catch {
        res.redirect('/')
    }
})



route.get('/add', (req, res) => {
    res.render('authors/add', { author: new Author() })
})


//create author route
route.post('/', async (req, res) => {
    console.log(req.body.name)
    const author = new Author({
        name: req.body.name

    })
    try {
        const newAuthor = await author.save()
        res.redirect('authors')
    } catch {
        res.render('authors/add', {
            author: author,
            errorMessage: 'Error creating Author'
        })
    }



    // author.save((err, newAuthor) => {
    //     if (err) {
    //         res.render('authors/add', {
    //             author: author,
    //             errorMessage: 'Error creating Author'
    //         })
    //     }
    //     else {
    //         res.redirect('authors')
    //     }
    // })
    //res.send(req.body.name)
})

module.exports = route