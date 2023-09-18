import express from "express"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import ProhibitedProduct from "../../model/ProhibitedProduct.js"
import { uploadImg } from '../../middleware/storage.js'
import { createProhibitedProductDir } from "../../middleware/createDir.js"
import { addProhibitedProductValidate } from "../../validation/prohibitedProduct.js"
import fs from 'fs'
import { deleteSingle, uploadSingle } from "../../helper/connectCloud.js"

const prohibitedProductAdminRoute = express.Router()

/**
 * @route GET /api/admin/prohibited-product
 * @description get all prohibited product 
 * @access private
 */
prohibitedProductAdminRoute.get('/',
    async (req, res) => {
        try {
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
            const page = req.query.page ? parseInt(req.query.page) : 0;
            const { sortBy, keyword } = req.query;
            let listKeyword = keyword
                ? {
                    $or: [{ name: { $regex: keyword, $options: "i" } }],
                }
                : {};
            const list = await ProhibitedProduct.find(listKeyword)
                .limit(pageSize)
                .skip(pageSize * page)
                .sort(`${sortBy}`);
            if (list) {
                return sendSuccess(res, "Get prohobited product successfully.", {
                    list,
                });
            } else { return sendError(res, "Information not found."); }
        } catch (error) {
            console.log(error);
            return sendServerError(res);
        }
    }
)

/**
 * @route GET /api/admin/prohibited-product/:name
 * @description get prohibited product by name
 * @access private
 */
prohibitedProductAdminRoute.get('/:name',
    async (req, res) => {
        try {
            const { name } = req.params;
            const prohibitedProduct = await ProhibitedProduct.find({ name: name });
            if (prohibitedProduct)
                return sendSuccess(
                    res,
                    "Get information of prohibited product successfully.",
                    prohibitedProduct
                );
            return sendError(res, "Information of prohibited product is not found.");
        } catch (error) {
            console.log(error);
            return sendServerError(res);
        }
    }
)

/**
 * @route POST /api/admin/prohibited-product/create
 * @description create new prohibited product
 * @access private
 */
prohibitedProductAdminRoute.post('/create', createProhibitedProductDir,
    uploadImg.single('image'),
    async (req, res) => {

        try {
            const error = addProhibitedProductValidate(req.body)
            if (error) return sendError(res, error)
            const { name, detail } = req.body;
            const isExist = await ProhibitedProduct.exists({ name })
            if (isExist) {
                return sendError(res, "Name is already existed.")
            }
            let file = await `${req.file.destination}${req.file.filename}`
            let nameImage = await req.file.fieldname + name.normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                .replace(/ /g, '')
            let result = await uploadSingle(file, "prohibitedProduct", nameImage)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
            }
            await ProhibitedProduct.create({ name: name, images: result, detail: detail })
            return sendSuccess(res, 'Create prohibied product successfully.', { name, detail })

        } catch (error) {
            console.log(error)
            if (req.image) unlinkSync(req.image.path)
            return sendServerError(res)
        }
    })

/**
 * @route PUT /api/admin/prohibited-product/image/:id
 * @description update image of a existing prohibited product
 * @access private
 */
prohibitedProductAdminRoute.put('/image/:id', createProhibitedProductDir,
    uploadImg.single('image'),
    async (req, res) => {
        try {
            const { id } = req.params;
            const isExist = await ProhibitedProduct.findById(id);
            if (isExist) {
                if (isExist.images) {
                    let splitUrl = await isExist.images.split('/')
                    let file = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
                    await deleteSingle(file)
                }
                let file = await `${req.file.destination}${req.file.filename}`
                let name = await req.file.fieldname + isExist.name.normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                    .replace(/ /g, '')
                let result = await uploadSingle(file, "prohibitedProduct", name)
                if (result) {
                    fs.unlinkSync(file, (err) => {
                        console.log(err)
                    })
                }
                await ProhibitedProduct.findByIdAndUpdate(id, { images: result })
                return sendSuccess(res, "Update image prohibited product successfully.")
            }
            return sendError(res, "Prohibited product not exists.")

        } catch (error) {
            console.log(error)
            if (req.image) unlinkSync(req.image.path)
            return sendServerError(res, error)
        }
    }
)

/**
 * @route PUT /api/admin/prohibited-product/:id
 * @description update information of a existing prohibited product
 * @access private
 */
prohibitedProductAdminRoute.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, detail } = req.body;
        const isExist = await ProhibitedProduct.findById(id);
        if (isExist) {
            const isExistName = await ProhibitedProduct.findOne({name: name});
            if (isExistName){
                if (isExistName._id.equals(isExist._id) === false)
                    return sendError(res, "Name is existed.")
            }
            await ProhibitedProduct.findByIdAndUpdate(id, { name: name, detail: detail })
            return sendSuccess(res, "Update information prohibited product successfully.")
        }
        return sendError(res, "Prohibited product not exists.")

    } catch (error) {
        console.log(error)
        if (req.image) unlinkSync(req.image.path)
        return sendServerError(res, error)
    }
})

/**
 * @route DELETE /api/admin/prohibited-product/:id
 * @description delete a existing prohibited product
 * @access private
 */
prohibitedProductAdminRoute.delete('/:id',
    async (req, res) => {
        const { id } = req.params;
        try {
            const isExist = await ProhibitedProduct.findById(id)
            if (!isExist)
                return sendError(res, "Prohibited product not exists.")
            let path = isExist.images.split('/');
            let name = path[path.length - 1].split('.')[0];
            let file = path[path.length - 2] + '/' + name;
            const dataDe = await deleteSingle(file);
            const data = await ProhibitedProduct.findByIdAndRemove(id)
            return sendSuccess(res, "Delete prohibited product successfully.", data)
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    })

export default prohibitedProductAdminRoute