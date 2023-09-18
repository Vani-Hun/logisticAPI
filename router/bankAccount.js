import express from "express";
import { verifyToken, verifyCustomer } from "../middleware/verify.js"
import User from "../model/User.js"
import Customer from "../model/Customer.js"
import { validateBankAccountUpdate, bankVerifyOTP } from "../validation/bank.js"
import multer from 'multer';
import path from 'path';
import { genarateOTP } from '../service/otp.js'
import { sendError, sendServerError, sendSuccess, sendAutoSMS } from "../helper/client.js"
import fs from 'fs'
import { createBankAccountsDir } from '../middleware/createDir.js'
import { uploadImg } from '../middleware/storage.js'
import { deleteSingle, uploadSingle } from "../helper/connectCloud.js"
const bankAccountRouter = express.Router();
let otpCheckValue = false;

bankAccountRouter.get('/', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.decoded.userId);
        if (!user) {
            return sendError(res, "User not found", 404);
        }

        const customer = await Customer.findById(user.role);
        if (!customer) {
            return sendError(res, "Customer not found", 404);
        }

        const bankAccountInfo = {
            bankName: customer.bank_name,
            accountNumber: customer.bank_account_number,
            branch: customer.branch,
            bank_account_number: customer.bank_account_number,
            bank_account_owner_name: customer.bank_account_owner_name,
            identity_card_number: customer.identity_card_number,
            identity_card_front_image: customer.identity_card_front_image,
            identity_card_back_image: customer.identity_card_back_image,
        };

        return sendSuccess(res, 'get about information successfully.', bankAccountInfo)
    } catch (error) {
        console.log(error);

        sendError(res, "Internal server error", 500);
    }
});



bankAccountRouter.post('/bank-update', verifyToken, createBankAccountsDir, 
    // uploadImg.fields([
    //     { name: 'identity_card_front_image', maxCount: 1 },
    //     { name: 'identity_card_back_image ', maxCount: 1 }
    // ],
    //  uploadImg.single('identity_card_front_image'),
    //  uploadImg.single('identity_card_back_image'),
     uploadImg.any(),
async (req, res) => {
    try {  
        const user = await User.findById(req.decoded.userId);
        let customer = await Customer.findById(user.role);
        if (!customer) {
            return sendError(res, "Customer not found", 404);
        }

        let { bankName, accountNumber, branch, bank_account_owner_name, identity_card_number } = req.body;
        let  identityCardFrontImagePath = null, identityCardBackImagePath = null;
        for (let i = 0; i < req.files.length; i++){
            let file = await `${req.files[i].destination}${req.files[i].filename}`
            let name = await req.files[i].fieldname
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                .replace(/ /g, '') + Date.now();
            let result = await uploadSingle(file, "bankAccount", name)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
            }
            if (req.files[i].fieldname == "identity_card_front_image"){
                identityCardFrontImagePath = result;
            }
            if (req.files[i].fieldname == "identity_card_back_image"){
                identityCardBackImagePath = result;
            }
        }

        const errors = validateBankAccountUpdate(req.body);
        if (errors) {
            if (identityCardFrontImagePath){
                let _path = identityCardFrontImagePath.split('/');
                let _name = _path[_path.length - 1].split('.')[0];
                let _file = _path[_path.length - 2] + '/' + _name;
                await deleteSingle(_file);
            };
            if (identityCardBackImagePath){
                let _path = identityCardBackImagePath.split('/');
                let _name = _path[_path.length - 1].split('.')[0];
                let _file = _path[_path.length - 2] + '/' + _name;
                await deleteSingle(_file);
            };
            return sendError(res, errors);
        }
 
        customer.bank_name = bankName
        customer.bank_account_number = accountNumber
        customer.branch = branch
        customer.bank_account_owner_name = bank_account_owner_name
        customer.identity_card_number = identity_card_number

        if (identityCardFrontImagePath) {
            customer.identity_card_front_image = identityCardFrontImagePath
        }      

        if (identityCardBackImagePath) {
            customer.identity_card_back_image = identityCardBackImagePath
        }

        await customer.save();

        return sendSuccess(res, 'Update bank account information successfully', customer);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

bankAccountRouter.post('/verify-otp', verifyToken, async (req, res) => {
    const errors = bankVerifyOTP(req.body)
    if (errors) {
        return sendError(res, errors)
    }
    try {
        if (!req.session.updateBank) {
            return sendError(res, 'Session error.', 404);
        }
        const { bankName, accountNumber, branch, bank_account_owner_name, identity_card_number, identity_card_front_image, identity_card_back_image, otp } = JSON.parse(req.session.updateBank);
        const user = await User.findById(req.decoded.userId);
        if (!user) {
            return sendError(res, "User not found", 404);
        }
        const customer = await Customer.findById(user.role);
        if (!customer) {
            return sendError(res, "Customer not found", 404);
        }
        if (req.body.otp !== otp.value || otp.expired < Date.now()) {
            if (identity_card_front_image) {
                fs.unlinkSync(identity_card_front_image);
            }
            if (identity_card_back_image) {
                fs.unlinkSync(identity_card_back_image);
            }
            return sendError(res, 'validate failed.');
        }
        customer.bank_name = bankName;
        customer.bank_account_number = accountNumber;
        customer.branch = branch;
        customer.bank_account_owner_name = bank_account_owner_name;
        customer.identity_card_number = identity_card_number;

        if (identity_card_front_image) {
            const destinationPath = 'public/bankaccount/' + path.basename(identity_card_front_image);
            fs.renameSync(identity_card_front_image, destinationPath);
            customer.identity_card_front_image = destinationPath;
        }
        if (identity_card_back_image) {
            const destinationPath = 'public/bankaccount/' + path.basename(identity_card_back_image);
            fs.renameSync(identity_card_back_image, destinationPath);
            customer.identity_card_back_image = destinationPath;
        }
        await customer.save();
        otpCheckValue = true;

        return sendSuccess(res, "Update bank account information successfully.");
    } catch (error) {
        console.log(error);
        sendError(res, "Internal server error", 500);
    }
});

bankAccountRouter.post('/update-otp', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.decoded.userId);
        if (!user) {
            return sendError(res, "User not found", 404);
        }
        const sessionStore = JSON.parse(req.session.updateBank)
        const otp = genarateOTP();
        const phone = `+84${user.phone.slice(1)}`;
        const options = {
            from: process.env.PHONE_NUMBER,
            to: phone,
            body: `Your new OTP is: ${otp.value}`
        }
        const sendSMSSuccess = await sendAutoSMS(options);
        if (!sendSMSSuccess) return sendError(res, 'send OTP failed.')

        sessionStore.otp = otp
        req.session.updateBank = JSON.stringify(sessionStore);

        return sendSuccess(res, 'New OTP sent successfully.');
    } catch (error) {
        console.log(error);
        sendError(res, "Internal server error", 500);
    }
});

export default bankAccountRouter;
