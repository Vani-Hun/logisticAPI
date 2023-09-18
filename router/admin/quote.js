import express from "express"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import { uploadImg } from "../../middleware/storage.js"
import { createQuoteDir } from "../../middleware/createDir.js"
import { createQuoteValidate } from "../../validation/quote.js"
import { unlinkSync } from 'fs'
import Quote from "../../model/Quote.js"
import DeliveryService from "../../model/DeliveryService.js"
import fs from 'fs'
import { deleteSingle, uploadSingle } from "../../helper/connectCloud.js"
const quoteAdminRoute = express.Router()

/**
 * @route POST /api/admin/quote/:serviceId
 * @description create a new quote
 * @access private
 */
quoteAdminRoute.post('/:serviceId',
    createQuoteDir,
    uploadImg.single('avatar'),
    async (req, res) => {
        const error = createQuoteValidate(req.body)
        if (error) return sendError(res, error)

        try {
            const { serviceId } = req.params
            const isExistedService = await DeliveryService.exists({ _id: serviceId })
            if (!isExistedService) return sendError(res, "Service is not existed.")

            const { name, description, quote } = req.body;
            const isExistedName = await Quote.exists({ name: name })
            if (isExistedName) return sendError(res, "This person is existed !")
            const isExist = await Quote.exists({
                $and: [
                    { name, description }
                ]
            })
            if (isExist) {
                return sendError(res, "This person is existed !")
            }
            let file = await `${req.file.destination}${req.file.filename}`
            let nameAvatar = await req.file.filename + name.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/ /g, '') + Date.now();
            let result = await uploadSingle(file, "quote", nameAvatar)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
            }
            const newQuote = await Quote.create({ name, avatar: result, description, quote });
            await DeliveryService.updateOne({ _id: serviceId }, { $push: { quotes: newQuote } })
            return sendSuccess(res, 'Create quote successfully.', { name, description, quote })

        } catch (error) {
            console.log(error)
            if (req.avatar) unlinkSync(req.avatar.path)
            return sendServerError(res)
        }
    }
)

/**
 * @route PUT /api/admin/quote/:id
 * @description update content of quote by quoteId
 * @access private
 */
quoteAdminRoute.put('/:id',
    createQuoteDir,
    uploadImg.single('avatar'),
    async (req, res) => {
        try {
            const { id } = req.params
            const isExist = await Quote.findOne({_id: id})
            if (!isExist) return sendError(res, "Quote does not exist.")
            const { name, description, quote } = req.body
            const data = await Quote.findByIdAndUpdate(id, { name, description, quote })
            return sendSuccess(res, "Update quote successfully.", { name, description, quote })

        } catch (error) {
            console.log(error)
            if (req.avatar) unlinkSync(req.avatar.path)
            return sendServerError(res)
        }
    }
)

/**
* @route PUT /api/admin/quote/avatar/{quoteId}
* @description update quote avatar by id
* @access private
*/
quoteAdminRoute.put('/avatar/:quoteId',
    createQuoteDir,
    uploadImg.single('avatar'),
    async (req, res) => {
        try {
            const id  = req.params.quoteId
            const isExist = await Quote.findOne({_id: id})
            if (!isExist) return sendError(res, "Quote does not exist.")
            if (isExist.avatar) {
                let splitUrl = await isExist.avatar.split('/')
                let file = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
                await deleteSingle(file)
            }
            let file = await `${req.file.destination}${req.file.filename}`
            let nameAvatar = await req.file.filename + isExist.name.normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                    .replace(/ /g, '') + Date.now();
            let result = await uploadSingle(file, "quote", nameAvatar)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
            }
            const data = await Quote.findByIdAndUpdate(id, { avatar: result })
            return sendSuccess(res, "Update quote avatar successfully.")
        } catch (error) {
            console.log(error)
            if (req.file) unlinkSync(req.file.path)
            return sendServerError(res)
        }
    }
)

/**
 * @route DELETE /api/admin/quote/:id
 * @description delete a quote by quoteId
 * @access private
 */
quoteAdminRoute.delete('/:id',
    async (req, res) => {
        const { id } = req.params;
        try {
            const isExist = await Quote.findOne({_id: id});
            if (!isExist) return sendError(res, "Quote does not exist.");
            await DeliveryService.updateOne({}, { $pull: { quotes: id } })
            let path = isExist.avatar.split('/');
            let name = path[path.length - 1].split('.')[0];
            let file = path[path.length - 2] + '/' + name;
            const dataDe = await deleteSingle(file);
            const data = await Quote.findByIdAndRemove(id)
            return sendSuccess(res, "Delete quote successfully.", data)
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

export default quoteAdminRoute