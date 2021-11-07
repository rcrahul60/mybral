const express = require('express')
const route = express.Router()
const path = require('path')
const fs = require('fs')
const Book = require('../models/book')
const Author = require('../models/author')
const { Router } = require('express')
const book = require('../models/book')
const imageMimeTypes = ['image/png', 'images/jpeg', 'image/jpeg', 'image/jpg', 'image/gif']


route.get('/', async (req, res) => {
    let query = Book.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try {
        const books = await query.exec({})
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})



route.get('/add', async (req, res) => {
    console.log("check")
    renderNewPage(res, new Book())
})


//create book route
route.post('/', async (req, res) => {

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount


    })
    saveCover(book, req.body.cover)
    try {
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
    } catch {
        //console.log(e)

        renderNewPage(res, book, true)
    }
})


route.get('/:id', async (req, res) => {
    try {

        const book = await Book.findById(req.params.id).populate('author').exec()
        res.render('books/show', { book: book })
    } catch {
        res.redirect('/')
    }
})


route.delete('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')

    } catch {
        if (book != null) {
            res.render('books/show', {
                book: book,
                errorMessage: 'Could not remove book'
            })
        }
        else {
            res.redirect('/')
        }

    }
})

route.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    } catch {
        res.redirect('/')
    }
})

//update book route
route.put('/:id', async (req, res) => {
    let book

    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.publishDate = new Date(req.body.publishDate)
        book.auth = req.body.author
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if (req.body.cover != null && req.body.cover != '') {
            saveCover(book, req.body.cover)
        }
        await book.save()
        res.redirect(`books/${book.id}`)
    } catch {
        //console.log(e)
        if (book != null) {
            renderEditPage(res, book, true)
        }
        else {
            res.redirect('/')
        }

    }
})



function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }

}

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'add', hasError)

}

async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false) {
    try {
        console.log("thos")
        const authors = await Author.find({})
        console.log(authors)
        const params = {
            book: book,
            authors: authors
        }
        if (hasError) {
            if (form === 'edit') {
                params.errorMessage = 'Error Updating books'
            }
            else {
                params.errorMessage = 'Error creating books'

            }
        }

        res.render(`books/${form}`, params)
    } catch {
        res.redirect('/books')
    }
}

module.exports = route