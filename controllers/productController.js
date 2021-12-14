const router = require('express').Router()
const { isUser } = require('../middlewares/guards.js')
const { deleteProduct } = require('../services/product.js')
const {getUserById}= require('../services/user.js')

router.get('/create', isUser(), async (req, res) => {

    res.render('product/create')
})

router.post('/create', isUser(), async (req, res) => {

    const productData = {
        name: req.body.name,
        technique: req.body.technique,
        imageUrl: req.body.imageUrl,
        certificate: req.body.certificate,
        author: req.user._id
    }

    try {
        await req.storage.createProduct(productData)

        res.redirect('/catalog')
    } catch (err) {
        console.log(err)
        let errors
        if (err.errors) {
            errors = Object.values(err.errors).map(e => e.properties.message)
        } else {
            errors = [err.message]
        }

        const ctx = {
            errors,
            productData: {
                name: req.body.name,
                technique: req.body.technique,
                imageUrl: req.body.imageUrl,
                certificate: req.body.certificate,
            }

        }
        res.render('product/create', ctx)
    }
})

router.get('/details/:id', async (req, res) => {
    
    try {
        const product = await req.storage.getProductById(req.params.id)
        product.hasUser = Boolean(req.user)
        product.isAuthor = req.user && req.user._id == product.author._id
        product.isntAuthor = req.user && req.user._id != product.author._id
        product.isVoted = req.user && product.voted.find(x => x._id == req.user._id)

        
        res.render('product/details', { product })
    } catch (err) {
        res.redirect('/404')

    }
})
router.get('/edit/:id', isUser(), async (req, res) => {
    try {

        const product = await req.storage.getProductById(req.params.id)

        if (req.user._id != product.author._id) {
            throw new Error('Cannot edit')
        }
        res.render('product/edit', { product })
    } catch (err) {
        console.log(err)
        res.redirect('/')
    }
})
router.post('/edit/:id', isUser(), async (req, res) => {
    try {
        const product = await req.storage.getProductById(req.params.id)
        if (req.user._id != product.author._id) {
            throw new Error('Cannot edit')
        }
        await req.storage.editProduct(req.params.id, req.body)
        res.redirect('/products/details/' + req.params.id)
    } catch (err) {
        let errors
        if (err.errors) {
            errors = Object.values(err.errors).map(e => e.properties.message)
        } else {
            errors = [err.message]
        }

        const ctx = {
            errors,
            product: {
                _id: req.params.id,
                name: req.body.name,
                technique: req.body.technique,
                imageUrl: req.body.imageUrl,
                certificate: req.body.certificate,

            }
        }
        res.render('product/edit', ctx)
    }
})

router.get('/delete/:id', isUser(), async (req, res) => {
    try {
        const product = await req.storage.getProductById(req.params.id)

        if (req.user._id != product.author._id) {
            throw new Error('Cannot delete')
        }

        deleteProduct(product)
        res.redirect('/catalog')
    } catch (err) {
        res.redirect('/404')
    }
})

router.get('/vote-up/:id', isUser(), async (req, res) => {
    try {
        const product = await req.storage.getProductById(req.params.id)
        if (req.user._id == product.author._id) {
            throw new Error('Cannot share')
        }

        await req.storage.voteProductUp(req.params.id, req.user._id)
        res.redirect('/products/details/' + req.params.id)
    } catch (err) {
        res.redirect('/404')
    }
})


module.exports = router