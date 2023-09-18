import express from 'express'
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import { expenseCategoryValidate } from '../../validation/expenseCategory.js'
import ExpenseCategory from '../../model/ExpenseCategory.js'

const expenseCategoryAdminRoute = express.Router()

/**
 * @route POST api/admin/expense-category
 * @description create new expense category
 * @access private
 */
expenseCategoryAdminRoute.post("/", async(req, res) => {
    try {
        const errors = expenseCategoryValidate(req.body)
        if(errors)
            return sendError(res, errors)
        const { name, description } = req.body
        if(!name) {
            return sendError(res, 'Please enter name expense category.')
        }
        if(!description){
            return sendError(res, 'Please enter description expense category.')
        }
        const expenseCategory = await ExpenseCategory.create({ name, description })
        if(expenseCategory)
            return sendSuccess(res, 'Create new expense category successfully.', expenseCategory)
        return sendError(res, 'Create new expense category failed.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route PUT api/admin/expense-category/:idExpenseCategory
 * @description update a expense category
 * @access private
 */
expenseCategoryAdminRoute.put("/:idExpenseCategory", async(req, res) => {
    try {
        const { idExpenseCategory } = req.params
        if(!idExpenseCategory.match(/^[0-9a-fA-F]{24}$/)){
            return sendError(res, 'ID expense category does not exist.')
        }
        const errors = expenseCategoryValidate(req.body)
        if(errors){
            return sendError(res, errors)
        }
        const { name, description } = req.body
        const expenseCategory = await ExpenseCategory.findByIdAndUpdate(idExpenseCategory, {
            name: name,
            description: description
        })
        if(expenseCategory)
            return sendSuccess(res, 'Update expense category successfully.', {
                _id: idExpenseCategory,
                name: name,
                description: description
            })
        return sendError(res, 'ID expense category does not exist.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route DELETE api/admin/expense-category/:idExpenseCategory
 * @description delete a expense category
 * @access private
 */
expenseCategoryAdminRoute.delete("/:idExpenseCategory", async(req, res) => {
    try {
        const { idExpenseCategory } = req.params
        if(!idExpenseCategory.match(/^[0-9a-fA-F]{24}$/)){
            return sendError(res, 'ID expense category does not exist.')
        }
        const expenseCategory = await ExpenseCategory.findById({ _id: idExpenseCategory })
        if(expenseCategory){
            await ExpenseCategory.findByIdAndDelete({ _id: idExpenseCategory })
            return sendSuccess(res, 'Delete expense category successfully.', expenseCategory)
        }
        return sendError(res, 'ID expense category does not exist.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

export default expenseCategoryAdminRoute