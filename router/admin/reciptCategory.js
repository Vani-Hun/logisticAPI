import express from "express"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import ReciptCategory from "../../model/ReciptCategory.js"
import ExpenseCategory from '../../model/ExpenseCategory.js'
import { reciptCategoryValidate } from "../../validation/reciptCategory.js"
import Staff from "../../model/Staff.js"

const reciptCategoryAdminRoute = express.Router()

/**
 * @route POST api/admin/recipt-category/
 * @description create new recipt category
 * @access private 
 */
reciptCategoryAdminRoute.post("/", async(req, res) => {
    try {
        const errors = reciptCategoryValidate(req.body)
        if(errors) {
            return sendError(res, errors)
        }
        const { expense_category, staff, amount, status } = req.body
             
        if(!expense_category.match(/^[0-9a-fA-F]{24}$/)){
            return sendError(res, 'ID expense category does not exist.')
        }

        if(!staff.match(/^[0-9a-fA-F]{24}$/)){
            return sendError(res, 'ID staff does not exist.')
        }
        
        if(!amount){
            return sendError(res, 'Please enter amount.')
        }

        const isExistExpenseCate = await ExpenseCategory.findById({ _id: expense_category })
        if(!isExistExpenseCate) return sendError(res, 'ID expense category does not exist.')

        const isExistStaff = await Staff.findById({ _id: staff })
        if(!isExistStaff) return sendError(res, 'ID staff does not exist.')

        const reciptCategory = await ReciptCategory.create({
            expense_category: expense_category,
            staff: staff,
            amount: amount,
            status: status
        })
        if(reciptCategory) {
            return sendSuccess(res, 'Create recipt category successfully.', reciptCategory)
        }
        return sendError(res, 'Create recipt category failed.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route PUT api/admin/recipt-category/:idReciptCategory
 * @description update recipt category
 * @access private 
 */
reciptCategoryAdminRoute.put("/:idReciptCategory", async(req, res) => {
    try {
        const { idReciptCategory } = req.params
        const errors = reciptCategoryValidate(req.body)
        if(errors){
            return sendError(res, errors)
        }
        const { expense_category, staff, amount, status } = req.body
        const existExpenseCate = await ExpenseCategory.findById({ _id: expense_category })
        if(!existExpenseCate){
            return sendError(res, 'ID expense category does not exist.')
        }
        const existStaff = await Staff.findById({ _id: staff })
        if(!existStaff){
            return sendError(res, 'ID staff does not exist.')
        }
        const reciptCategory = await ReciptCategory.findByIdAndUpdate(idReciptCategory, {
            _id: idReciptCategory,
            expense_category: expense_category,
            staff: staff,
            amount: amount,
            status: status
        })
        if(reciptCategory){
            return sendSuccess(res, 'Update recipt category successfully.', reciptCategory)
        }
        return sendError(res, 'ID recipt category does not exist.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route DELETE api/admin/recipt-category/:idReciptCategory
 * @description delete recipt category
 * @access private 
 */
reciptCategoryAdminRoute.delete("/:idReciptCategory", async(req, res) => {
    try {
        const { idReciptCategory } = req.params
        const reciptCategory = await ReciptCategory.findById({ _id: idReciptCategory })
        if(reciptCategory){
            await ReciptCategory.findByIdAndDelete({ _id: idReciptCategory })
            return sendSuccess(res, 'Delete recipt category successfully.', reciptCategory)
        }
        return sendError(res, 'ID recipt ccategory does not exist.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

export default reciptCategoryAdminRoute

