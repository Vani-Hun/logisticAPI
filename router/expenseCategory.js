import express from 'express'
import { sendError, sendServerError, sendSuccess } from "../helper/client.js"
import ExpenseCategory from '../model/ExpenseCategory.js'

const expenseCategoryRoute = express.Router()

/**
 * @route GET api/expense-category/
 * @description get all expense category
 * @access public
 */
expenseCategoryRoute.get("/", async(req, res) => {
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0
        const page = req.query.page ? parseInt(req.query.page) : 0
        const { keyword, sortBy, name, description } = req.query
        let query = {}
        let keywordList = keyword
            ? {
                $or: [
                    { name: { $regex: keyword, $options: "i" } },
                    { description: { $regex: keyword, $options: "i" } }
                ]
            }  : {}
        if(name) {
            query.name = name
        }
        if(description) {
            query.description = description
        }
        const length = await ExpenseCategory.find({ $and: [query, keywordList] }).count()
        const expenseCategory = await ExpenseCategory.find({ $and: [query, keywordList] })
            .limit(pageSize)
            .skip(pageSize * page)
            .sort(`${sortBy}`)
        if(expenseCategory)
            return sendSuccess(res, 'Get expense category successfully', { length, expenseCategory })
        return sendError(res, 'Get expense category failed.')
        } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route GET api/expense-category/:idExpenseCategory
 * @description get expense category by id
 * @access public
 */
expenseCategoryRoute.get("/:idExpenseCategory", async(req, res) => {
    try {
        const { idExpenseCategory } = req.params
        if(!idExpenseCategory.match(/^[0-9a-fA-F]{24}$/)){
            return sendError(res, 'ID expense category does not exist.')
        }
        const expenseCategory = await ExpenseCategory.findById({ _id: idExpenseCategory })
        if(expenseCategory)
            return sendSuccess(res, 'Get expense category successfully.', expenseCategory)
        return sendError(res, 'ID expense category does not exist.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

export default expenseCategoryRoute