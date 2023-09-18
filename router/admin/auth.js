import express, { query } from 'express'
import argon2 from "argon2"
import { sendError, sendServerError, sendSuccess } from '../../helper/client.js'
import Staff from '../../model/Staff.js'
import User from '../../model/User.js'
import { staffRegisterValidate } from '../../validation/auth.js'
import Department from '../../model/Department.js'
import CarFleet from '../../model/CarFleet.js'
import PostOffice from '../../model/PostOffice.js'
import { STAFF_CODE } from '../../constant.js'
import mongoose from 'mongoose'
const authAdminRoute = express.Router()

/**
 * @route POST /api/admin/auth/register
 * @description register staff account
 * @access private
 */
authAdminRoute.post('/register', async (req, res) => {
    const errors = staffRegisterValidate(req.body)
    if (errors) { return sendError(res, errors) }

    let { name, address, email, password, phone, staff_type, staff_position, postOfficeCode, department, car_fleet } = req.body
    
    try {
        let staffs = [];
        let postOffice, departmentExist, carfleetExist;
        let querys = [];
        // check department
        if (department != null && department != undefined) {
            if (mongoose.isValidObjectId(department) == false) {
                return sendError(res, `department - ${department} is not valid objectId.`)
            }
            else {
                let query = Department.findById(department).then((value) => {
                    departmentExist = value;
                    if (!departmentExist && department != null) { 
                        return;
                    }
                })
                querys.push(query);
            }
        }
        // check carfleet
        if (car_fleet != null && car_fleet != undefined){
            if (mongoose.isValidObjectId(car_fleet) == false) {
                return sendError(res, `car_fleet - ${car_fleet} is not valid objectId.`)
            }
            else {
                let query = CarFleet.findById(car_fleet).then((value) => {
                    carfleetExist = value;
                    if (!carfleetExist && car_fleet != null) {
                        return sendError(res, 'Carfleet does not exits.') 
                    }
                })       
                querys.push(query);
            }
          
        }
        // check office
        if (postOfficeCode != null && postOfficeCode != undefined){
            let query = PostOffice.findOne({ code: postOfficeCode }).then( async(value) => {
                postOffice =value;
                if (postOffice == null || postOffice == undefined) {
                    return;
                }
                staffs = await Staff.find({
                    code : {
                        $regex: `${postOffice.code}` ,$options:"i"
                    }
                },
                {
                    _id : 1,
                }
                ).lean();
            })
            querys.push(query);
        }     
    
        // hash pasword
        let query = argon2.hash(password).then((value) => {
            password = value;
        })
        // check user
        let isExist = false;
        query = User.exists({ email }).then((value)=> {
            if (value) {
                isExist = true;
            }
        })
        querys.push(query);
        query = User.exists({ phone }).then((value)=> {
            if (value) {
                isExist = true;
            }
        })
        querys.push(query);

        await Promise.all(querys);
        
        if (!departmentExist && department != null) { 
            return sendError(res, 'Department does not exits.') 
        }
        if (!carfleetExist && car_fleet != null) {
            return sendError(res, 'Carfleet does not exits.') 
        }
        if (!postOffice  &&  postOfficeCode != null) {
            return sendError(res, 'postOffice not found.')
        }
        if (isExist) return sendError(res, 'Email/phone already used. Please change')

        let staffCode;
        if (postOfficeCode != null && postOfficeCode != undefined){
            staffCode =  postOfficeCode + String(staffs.length + 1).padStart(STAFF_CODE.LENGTH_OF_2ND_PART, '0');
        }
        else {
            const _staffs = await Staff.find({
                staff_type : staff_type,
            }).lean();
            staffCode = STAFF_CODE[staff_type] + String(_staffs.length + 1).padStart(STAFF_CODE.LENGTH_WITHOUT_POSTOFFICE, '0');
        }

        const newStaff = await Staff.create({
            code : staffCode,
            name,
            address,
            staff_type,
            staff_position,
            office: (postOfficeCode) ? postOffice._id : null,
            department,
            car_fleet
        })
     
        await User.create({
            name, email, password, phone, role: newStaff._id, isActive: true
        })
        return sendSuccess(res, 'user registered successfully.', newStaff)
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
}
)

export default authAdminRoute