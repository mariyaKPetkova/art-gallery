const Product = require('../models/Products.js')
const User = require('../models/User.js')

async function createProduct(productData){
    const product = new Product(productData)
    await product.save()
    return Product
}

async function getAllProducts(){
    const products = await Product.find({}).lean()
   
    return products
}

async function getProductById(id){
    const product = await Product.findById(id).populate('author').lean()
    
    return product
}

async function editProduct(id,productData){
    const product = await Product.findById(id)
    
    product.name = productData.name
    product.technique = productData.technique
    product.imageUrl = productData.imageUrl
    product.certificate = productData.certificate
    

    return product.save()
}
async function deleteProduct(product){
    return Product.findOneAndDelete(product)
    
}
async function shareProduct(productId,userId){
    const product = await Product.findById(productId)
    const user = await User.findById(userId)
    product.share.push(userId)
    user.share.push(productId)
    product.shares ++
    return Promise.all([product.save(),user.save()])
}



module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    editProduct,
    deleteProduct,
    shareProduct
}