import Insurance from "../../model/Insurance.js"
import Deparment from "../../model/Department.js"
import express from "express"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import { insuranceValidate } from "../../validation/insurance.js"

const insuranceRouteAdmin = express.Router()

/**
 * @route POST /api/admin/cargohandling
 * @description create a cargoHandling
 * @access private
 */
insuranceRouteAdmin.post("/", async (req, res) => {
    const errors = insuranceValidate(req.body)
    if (errors) return sendError(res, errors);
    let { name, department, type_of_insurance, company, cost, note } = req.body;
    try {
        const isExist = await Deparment.exists({ _id: department });
        if (!isExist) {
            return sendError(res, "This department is not existed.")
        }
        const insurance = await Insurance.create({ name, department, type_of_insurance, company, cost, note })
        return sendSuccess(res, "Create new insurance successfully.", insurance)
    } catch (error) {
        console.log(error)
        return sendServerError(res);
    }
})

/**
 * @route GET /api/admin/insurance
 * @description get all insurance
 * @access private
 */
insuranceRouteAdmin.get("/", async (req, res) => {
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
        let insurance = await Insurance.find(listKeyword)
            .limit(pageSize)
            .skip(pageSize * page)
            .sort(`${sortBy}`)
        if (insurance) {
            return sendSuccess(res, "Get insurance successfully.", insurance)
        } else { return sendError(res, "Information not found.") }
    } catch (error) {
        console.log(error)
        return sendError(res)
    }
})

/**
 * @route GET /api/admin/insurance
 * @description get a insurance by id
 * @access private
 */
insuranceRouteAdmin.get('/:id', async (req, res) => {
    try {
        let { id } = req.params
        const insurance = await Insurance.find({ _id: id })
        if (insurance) {
            return sendSuccess(res, "Get insurance successfully.", insurance)
        }
        return sendError(res, "There was no information found.")
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
* @route PUT /api/admin/insurance/:id
* @description update insurance
* @access private
*/
insuranceRouteAdmin.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, department, cost, note } = req.body;
    const isExist = await Deparment.exists({ _id: department });
    if (!isExist) {
        return sendError(res, "This department is not existed.")
    }
    try {
        const insurance = await Insurance.find({ _id: id })
        if (insurance) {
            await Insurance.updateOne({ name: name, department: department, cost: cost, note: note })
            return sendSuccess(res, "Update insurance successfully.", {
                name, department, cost, note
            })
        }
        return sendError(res, "insurance does not exist.");
    } catch (error) {
        return sendServerError(res);
    }
})

/**
 * @route DELETE /api/admin/insurance/:id
 * @description delete an existing insurance
 * @access private
 */
insuranceRouteAdmin.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const isExist = await Insurance.exists({ _id: id });
        if (!isExist) return sendError(res, "insurance does not exist.");
        const insurance = await Insurance.deleteOne({ _id: id });
        return sendSuccess(res, "Delete insurance successfully.", insurance);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
})

export default insuranceRouteAdmin