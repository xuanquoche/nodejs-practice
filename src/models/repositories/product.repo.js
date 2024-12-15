'use strict';

const { product, electronic, clothing, furniture } = require('../product.model');
const { Types } = require('mongoose');
const { NotFoundError } = require('../../core/error.response');

const  findAllDraftsForShop = async ({query, limit = 50, skip = 0}) => {
    return await queryProduct({query, limit, skip});
}

const findAllPublishForShop = async ({query, limit = 50, skip = 0}) => {
    return await queryProduct({query, limit, skip});
}

const searchProductByUser = async ({keySearch}) => {
    const regexSearch = new RegExp(keySearch);
    const results = await product.find({
        isDraft:false,
        $text: {$search: regexSearch}
    }, {
        score: {$meta: 'textScore'}
    }).sort({score: {$meta: 'textScore'}}).lean().exec();
    return results;
}

const publishProductByShop = async ({product_shop, product_id}) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })
    if(!foundShop) throw new NotFoundError('Product not found');    

    foundShop.isPublished = true;
    foundShop.isDraft = false;
    const {modifiedCount} = await foundShop.updateOne(foundShop);
    return modifiedCount;
}

const unPublishProductByShop = async ({product_shop, product_id}) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })
    if(!foundShop) throw new NotFoundError('Product not found');    

    foundShop.isPublished = false;
    foundShop.isDraft = true;
}

const queryProduct = async ({query, limit = 50, skip = 0}) => {
    return await product.find(query).populate('product_shop', 'name email -_id').sort({updatedAt: -1}).skip(skip).limit(limit).lean().exec();
}

module.exports = {
    findAllDraftsForShop,
    publishProductByShop,   
    findAllPublishForShop,
    unPublishProductByShop,
    searchProductByUser
}