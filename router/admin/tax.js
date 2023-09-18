import Tax from "../../model/Tax.js"
import express from "express"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import { taxValidate } from "../../validation/tax.js"

const taxRouteAdmin = express.Router()

/**
 * @route POST /api/admin/cargohandling
 * @description create a cargoHandling
 * @access private
 */
taxRouteAdmin.post("/", async (req, res) => {
    const errors = taxValidate(req.body)
    if (errors) return sendError(res, errors);
    let { name, cost, note } = req.body;
    try {
        const tax = await Tax.create({ name, cost, note })
        return sendSuccess(res, "Create new tax successfully.", tax)
    } catch (error) {
        console.log(error)
        return sendServerError(res);
    }
})

/**
 * @route GET /api/admin/tax
 * @description get all tax
 * @access private
 */
taxRouteAdmin.get("/", async (req, res) => {
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
        const page = req.query.page ? parseInt(req.query.page) : 0;
        const { sortBy, keyword } = req.query;
        let listKeyword = keyword
            ? {
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { cost: { $regex: keyword, $options: 'i' } }
                ]
            }
            : {}
        let tax = await Tax.find(listKeyword)
            .limit(pageSize)
            .skip(pageSize * page)
            .sort(`${sortBy}`)
        if (tax) {
            return sendSuccess(res, "Get tax successfully.", tax)
        } else { return sendError(res, "Information not found.") }
    } catch (error) {
        console.log(error)
        return sendError(res)
    }
})

/**
 * @route GET /api/admin/tax
 * @description get a tax by id
 * @access private
 */
taxRouteAdmin.get('/:id', async (req, res) => {
    try {
        let { id } = req.params
        const tax = await Tax.find({ _id: id })
        if (tax) {
            return sendSuccess(res, "Get tax successfully.", tax)
        }
        return sendError(res, "There was no information found.")
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
* @route PUT /api/admin/tax/:id
* @description update tax
* @access private
*/
taxRouteAdmin.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, cost, note } = req.body;
    try {
        const tax = await Tax.find({ _id: id })
        if (tax) {
            await Tax.updateOne({ name: name, cost: cost, note: note })
            return sendSuccess(res, "Update tax successfully.", {
                name, cost, note
            })
        }
        return sendError(res, "tax does not exist.");
    } catch (error) {
        return sendServerError(res);
    }
})

/**
 * @route DELETE /api/admin/tax/:id
 * @description delete an existing tax
 * @access private
 */
taxRouteAdmin.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const isExist = await Tax.exists({ _id: id });
        if (!isExist) return sendError(res, "tax does not exist.");
        const tax = await Tax.deleteOne({ _id: id });
        return sendSuccess(res, "Delete tax successfully.", tax);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
})

export default taxRouteAdmin