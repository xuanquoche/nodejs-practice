'use strict';

const {clothing,electronic,product} = require('../models/product.model')
const {BadRequestError} = require('../core/error.response')

//define factory class to create product

class ProductFactory {
    static async createProduct(type, payload) {
        switch (type) {
            case 'Clothing':
                return new Clothing(payload).createProduct();
            case 'Electronics':
                return new Electronic(payload).createProduct();
            default:
                throw new BadRequestError(`Invalid product type: ${type}`);
        }
    }
}

//define base product class

class Product {
    constructor({product_name, product_thumb, product_description, product_price, product_quantity, product_type, product_shop, product_attributes}) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_quantity = product_quantity;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;   
    }

    //create new product
    async createProduct(productId) {
        return await product.create({...this, _id: productId})
    }
}

//define sub-class for different product type clothings

class Clothing extends Product {
    // constructor({brand, size, material}) {
    //     super(payload);
    //     this.brand = brand;
    //     this.size = size;
    //     this.material = material;
    // }

    async createProduct() {
        const newClothing = await clothing.create(this.product_attributes);
        if(!newClothing) throw new BadRequestError('Create new clothing error');

        const newProduct = await super.createProduct(newClothing);
        if(!newProduct) throw new BadRequestError('Create new product error');

        return newProduct;
    }
}

//define sub-class for different product type electronics

class Electronic extends Product {
    async createProduct() {
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if(!newElectronic) throw new BadRequestError('Create new electronic error');

        const newProduct = await super.createProduct(newElectronic._id);
        if(!newProduct) throw new BadRequestError('Create new product error');

        return newProduct;
    }
}

module.exports = ProductFactory