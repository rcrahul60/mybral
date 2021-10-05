const express = require('express')
const route = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')

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

})

route.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({ author: author.id }).limit(6).exec()
        res.render('authors/show', {
            author: author,
            booksByAuthor: books
        })
    } catch (e) {
        console.log(e)
        res.redirect('/')
    }
    //res.send("this is author" + req.params.id)
})

route.get('/add', (req, res) => {
    res.render('authors/add', { author: new Author() })
})

route.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { author: author })
    } catch {
        res.redirect('/authors')
    }
})

route.put('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${author.id}`)
    } catch {
        if (author == null) {
            res.redirect('/')
        }
        else {
            res.render('authors/edit', {
                author: author,
                errorMessage: 'Error updating Author'
            })
        }

    }

})

route.delete('/:id', async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        console.log(author)
        await author.remove()
        res.redirect('/authors')
    } catch {
        if (author == null) {
            res.redirect('/')
        }
        else {
            res.redirect(`/authors/${author.id}`)

        }

    }
})
module.exports = route