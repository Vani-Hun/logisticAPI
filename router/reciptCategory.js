import express from "express"
import ReciptCategory from "../model/ReciptCategory.js"
import { sendServerError, sendSuccess, sendError } from "../helper/client.js"

const reciptCategoryRoute = express.Router()

/**
 * @route GET api/recipt-category
 * @description get all recipt category
 * @access public
 */
reciptCategoryRoute.get("/", async(req, res) => {
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0
        const page = req.query.page ? parseInt(req.query.page) : 0
        const { keyword, sortBy, expense_category, staff, amount, status } = req.query
        let query = {}
        let keywordList = keyword
            ? {
                $or: [
                    { expense_category: { $regex: keyword, $options: "i" } },
                    { staff: { $regex: keyword, $options: "i" } },
                    { amount: { $regex: keyword, $options: "i" } },
                    { statud: { $regex: keyword, $options: "i" } }
                ]
            } : {}
        if(expense_category){
            query.expense_category = expense_category
        }
        if(staff){
            query.staff = staff
        }
        if(amount){
            query.staff = staff
        }
        if(status){
            query.status = status
        }
        const length = await ReciptCategory.find({ $and: [query, keywordList] }).count()
        const reciptCategory = await ReciptCategory.find({ $and: [query, keywordList] })
            .limit(pageSize)
            .skip(pageSize * page)
            .sort(`${sortBy}`)
        if(reciptCategory){
            return sendSuccess(res, 'Get recipt category successfully.', { length, reciptCategory })
        }
        return sendError(res, 'Get recipt category failed.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route GET api/
 * @description get recipt category by id
 * @access public
 */
reciptCategoryRoute.get("/:idReciptCategory", async(req, res) => {
    try {
        const { idReciptCategory } = req.params
        if(!idReciptCategory.match(/^[0-9a-fA-F]{24}$/)){
            return sendError(res, 'ID recipt category does not exist.')
        }
        const reciptCategory = await ReciptCategory.findById({ _id: idReciptCategory })
        if(reciptCategory){
            return sendSuccess(res, 'Get recipt category successfully', reciptCategory)
        }
        return sendError(res, 'ID recipt category does not exist.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

export default reciptCategoryRoute