const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const { isGuest } = require('../middlewares/guards.js')
const {getUserById} = require('../services/user.js')

router.get('/register', isGuest(), (req, res) => {
    res.render('user/register')
})

router.post(
    '/register',
    isGuest(),
    body('username')
        .isLength({ min: 4 }).withMessage('Username must be at least 4 symbols'),
    body('password')
        .isLength({ min: 3 }).withMessage('Password must be at least 3 symbols'),
    body('repeatPassword').custom((value, { req }) => {
        if (value != req.body.password) {
            throw new Error('Passwords do not match')
        }
        return true
    }),
    body('address')
    .isLength({ min: 1 }).withMessage('Address is required')
    .isLength({ max: 20 }).withMessage('Address must be maximum 20 symbols'),
    async (req, res) => {
        const { errors } = validationResult(req)

        try {
            if (errors.length > 0) {
                const message = errors.map(err => err.msg).join('\n')
                throw new Error(message)
            }
            await req.auth.register(req.body.username, req.body.password,req.body.address)
            res.redirect('/')
        } catch (err) {
            console.log(errors)
            const ctx = {
                errors: err.message.split('\n'),
                userData: {
                    username: req.body.username,
                    email: req.body.email,
                    address: req.body.address
                }
            }
            res.render('user/register', ctx)
        }

    }
)

router.get('/login', isGuest(), (req, res) => {
    res.render('user/login')
})

router.post('/login', isGuest(), async (req, res) => {
    try {
        await req.auth.login(req.body.username, req.body.password)
        res.redirect('/')
    } catch (err) {
        console.log(err)
        const ctx = {
            errors: [err.message],
            userData: {
                username: req.body.username
            }
        }
        res.render('user/login', ctx)
    }
})
router.get('/logout', (req, res) => {
    req.auth.logout()
    res.redirect('/')
})

router.get('/my-posts', async (req, res) => {
    
    const userData = await getUserById(req.user._id)
    const posts = await req.storage.getAllProducts()

    const userP = posts.filter(x => x.author == req.user._id).map(x=>x.name)
    userData.userPosts = userP.length > 0? userP.join(', '): 'Not yet.'

    //const userS = userData.userShare.reduce(()=>{posts.filter(x => x._id == sharedProductId).map(x=>x.name)
    userData.userShare = userData.share.length > 0? userData.share.join(', '): 'Not yet.'
    console.log(userData)
    res.render('user/my-posts',{userData})
})
module.exports = router