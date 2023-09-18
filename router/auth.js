import express from "express"
import jwt from "jsonwebtoken"
import argon2 from "argon2"
import User from "../model/User.js"
import { userLoginValidate, customerRegisterValidate, userVerifyOTP, userForgotPw, userChangePw,
    customerRegisterValidateEmail,
    userVerifyOTPByEmail,
    userUpdateBasicInfo,
    userLoginValidateByEmail,
    userVerifyOTPByPhone,
    userLoginValidateByPhone,
    customerRegisterValidatePhone,
} from "../validation/auth.js"
import { sendError, sendServerError, sendSuccess, sendAutoMail, sendAutoSMS } from "../helper/client.js"
import Customer from "../model/Customer.js"
import Staff from "../model/Staff.js"
import { CUSTOMER, JWT_EXPIRED, JWT_REFRESH_EXPIRED, VERIFY_OP } from '../constant.js'
import { genarateOTP } from '../service/otp.js'
import { createKeyToken } from '../service/auth.js'
import { TOKEN_BLACKLIST, TOKEN_LIST } from "../index.js"
import { verifyToken } from "../middleware/verify.js"
import { createTokenPair, createNewTokenPair } from "../middleware/auth.js"
import { renewPw } from "../service/password.js"
import { clearTokenList } from '../service/jwt.js'
import CarFleet from "../model/CarFleet.js"
import crypto from "node:crypto"
import KeyToken from "../model/KeyToken.js"
import Otp from "../model/Otp.js"
const authRoute = express.Router()

/**
 * @route POST /api/auth/email/register
 * @description customer register
 * @access public
 */
authRoute.post('/email/register', async (req, res) => {
    const errors = customerRegisterValidateEmail(req.body)
    if (errors)
        return sendError(res, errors)

    let { email } = req.body

    try {
        const isExist = await User.exists({ email });
        if (isExist)
            return sendError(res, 'user already exists.')

        const otp = genarateOTP()
        const hashOtp =  await argon2.hash(otp.value);
        await Otp.create({email, otp : hashOtp});

        const options = {
            from: process.env.MAIL_HOST,
            to: email,
            subject: '[noreply-Logistics Webapp] Xác thực email',
            html: `<p>Nhập mã OTP để hoàn tất đăng ký: <i><b>${otp.value}</b></i></p>`
        }

        const sendMailSuccess = await sendAutoMail(options)
        if (!sendMailSuccess) return sendError(res, 'send OTP failed.')

        return sendSuccess(res, `send otp code to ${email} successfully. Please check email`);

    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route POST /api/auth/email/verify-otp
 * @description customer verify otp
 * @access public
 */
authRoute.post('/email/verify-otp', async (req, res) => {
    const errors = userVerifyOTPByEmail(req.body)
    if (errors)
        return sendError(res, errors)
    
    try {
        const { email, otp } = req.body;
        const otps = await Otp.find({email})

        if (otps.length == 0){
            return sendError(res, "Otp is exprided");
        }
        
        const lastOtp = otps[otps.length - 1];

        const isOtpCorrect = await argon2.verify(lastOtp.otp, otp);
        if (isOtpCorrect == false ) {
            return sendError(res, "Otp is not correct");
        }

        const newCustomer = await Customer.create({});

        const user = await User.create({
            email : email, 
            role: newCustomer._id, 
            isActive: true,
        })

        const tokens = await createTokenPair(
            { userId: user._id, role: newCustomer.customer_type }, "publicKey", "privateKey");

        return sendSuccess(res, 'user registered successfully.', {
            "accessToken": tokens.accessToken,
            "refreshToken": tokens.refreshToken,
        });

    } catch (error) {
        console.log(error.message)
        return sendServerError(res)
    }
})


/**
 * @route POST /api/auth/phone/register
 * @description customer register by phone
 * @access public
 */
authRoute.post('/phone/register', async (req, res) => {
    const errors = customerRegisterValidatePhone(req.body)
    if (errors)
        return sendError(res, errors)

    let { phone } = req.body

    try {
        // check user exists
        const isExist = await User.exists({ phone });
        if (isExist)
            return sendError(res, 'user already exists.')

        // create otp
        const otp = genarateOTP()
        const hashOtp =  await argon2.hash(otp.value);
        await Otp.create({phone, otp : hashOtp});
        
        // send sms
        const options = {
            from: process.env.PHONE_NUMBER,
            to: `+84${phone.substr(1, phone.length - 1)}`,
            body: `Nhập mã OTP để xác nhận đăng ký: ${otp.value}`
        }

        // const sendSMSSuccess = await sendAutoSMS(options)
        // if (!sendSMSSuccess) return sendError(res, 'send OTP failed.')

        return sendSuccess(res, `send otp code to ${phone} successfully. Please check sms`, {
            otp : otp.value,
        });

    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route POST /api/auth/phone/verify-otp
 * @description customer verify otp by phone
 * @access public
 */
authRoute.post('/phone/verify-otp', async (req, res) => {
    const errors = userVerifyOTPByPhone(req.body)
    if (errors)
        return sendError(res, errors)
    
    try {
        const { phone, otp } = req.body;
        const otps = await Otp.find({phone})

        if (otps.length == 0){
            return sendError(res, "Otp is exprided");
        }
        
        const lastOtp = otps[otps.length - 1];

        const isOtpCorrect = await argon2.verify(lastOtp.otp, otp);
        if (isOtpCorrect == false ) {
            return sendError(res, "Otp is not correct");
        }

        const newCustomer = await Customer.create({});

        const user = await User.create({
            phone : phone, 
            role: newCustomer._id, 
            isActive: true,
        })

        const tokens = await createTokenPair(
            { userId: user._id, role: newCustomer.customer_type }, "publicKey", "privateKey");

        return sendSuccess(res, 'user registered successfully.', {
            "accessToken": tokens.accessToken,
            "refreshToken": tokens.refreshToken,
        });

    } catch (error) {
        console.log(error.message)
        return sendServerError(res)
    }
})


/**
 * @route PATCH /api/auth/update-basic-info
 * @description customer update basic info
 * @access public
 */
authRoute.patch('/update-basic-info', verifyToken, async (req, res) => {
    const errors = userUpdateBasicInfo(req.body)
    if (errors)
        return sendError(res, errors)
    
    try {
        let { name, password, address } = req.body;
        let user = await User.findById(req.decoded.userId);
        let customer = await Customer.findById(user.role);

        // update user
        password = await argon2.hash(password)
        user.password = password;

        // update customer
        customer.name = name;
        customer.address = address;

        await Promise.all([
            user.save(),
            customer.save()
        ]);
        
        return sendSuccess(res, 'Customer update basic info successfully.');

    } catch (error) {
        console.log(error.message)
        return sendServerError(res)
    }
})


/**
 * @route POST /api/auth/email/login
 * @description customer login by email
 * @access public
 */
authRoute.post('/email/login', async (req, res) => {
    const errors = userLoginValidateByEmail(req.body)
    if (errors)
        return sendError(res, errors)

    let { email, password } = req.body
    try {
        let user = await User.findOne({
            email: { $ne: null, $eq: email },
            isActive: true
        }).populate({ path: 'role', model: Customer })

        // check is user deleted
        if (user.delete) return sendError(res, "You have deleted your account. Please contact the nearest facility if you want to restore", 403);
        
        let success = true
        if (!user) success = false
        else if (!user.role)
            return sendError(res, 'your role is not valid. access denied.', 403)
        else {
            const passwordValid = await argon2.verify(user.password, password)
            if (!passwordValid) success = false
        }

        if (!success)
            return sendError(res, 'email or password is wrong.')

        const tokens = await createTokenPair({ userId: user._id, role: user.role.customer_type }, "publicKey", "privateKey")

        return sendSuccess(res, 'Login successfully.',
            {
                "accessToken": tokens.accessToken,
                "refreshToken": tokens.refreshToken,
            }
        );
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route POST /api/auth/phone/login
 * @description customer login by phone
 * @access public
 */
authRoute.post('/phone/login', async (req, res) => {
    const errors = userLoginValidateByPhone(req.body)
    if (errors)
        return sendError(res, errors)

    let { email, password } = req.body
    try {
        let user = await User.findOne({
            email: { $ne: null, $eq: email },
            isActive: true
        }).populate({ path: 'role', model: Customer })

        // check is user deleted
        if (user.delete) return sendError(res, "You have deleted your account. Please contact the nearest facility if you want to restore", 403);
        
        let success = true
        if (!user) success = false
        else if (!user.role)
            return sendError(res, 'your role is not valid. access denied.', 403)
        else {
            const passwordValid = await argon2.verify(user.password, password)
            if (!passwordValid) success = false
        }

        if (!success)
            return sendError(res, 'email or password is wrong.')

        const tokens = await createTokenPair({ userId: user._id, role: user.role.customer_type }, "publicKey", "privateKey")

        return sendSuccess(res, 'Login successfully.',
            {
                "accessToken": tokens.accessToken,
                "refreshToken": tokens.refreshToken,
            }
        );
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})
/**
 * @route POST /api/auth/login
 * @description customer login
 * @access public
 */
authRoute.post('/login', async (req, res) => {
    const errors = userLoginValidate(req.body)
    if (errors)
        return sendError(res, errors)

    let { email, phone, password } = req.body
    try {
        let user = await User.findOne({
            email: { $ne: null, $eq: email },
            isActive: true
        }).populate({ path: 'role', model: Customer })
        if (!user) {
            user = await User.findOne({
                phone: { $ne: null, $eq: phone },
                isActive: true
            }).populate({ path: 'role', model: Customer })
        }
        if (user.delete) return sendError(res, "You have deleted your account. Please contact the nearest facility if you want to restore", 403);
        let success = true
        if (!user) success = false
        else if (!user.role)
            return sendError(res, 'your role is not valid. access denied.', 403)
        else {
            const passwordValid = await argon2.verify(user.password, password)
            if (!passwordValid) success = false
        }

        if (!success)
            return sendError(res, 'email/phone or password is wrong.')

        const userData = {
            id: user._id,
            email: user.email,
            phone: user.phone,
            role: user.role
        }
        const tokens = await createTokenPair({ userId: user._id, role: user.role.customer_type }, "publicKey", "privateKey")
        const publicKeyString = await createKeyToken(user._id, tokens.refreshToken, "privateKey", "publicKey")
        const response = await {
            "status": "Logged in",
            "accessToken": tokens.accessToken,
            "refreshToken": tokens.refreshToken,
            "user": userData
        }
        return sendSuccess(res, 'Login successfully.', response);
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route POST /api/auth/staff-login
 * @description staff login
 * @access public
 */
authRoute.post('/staff-login', async (req, res) => {
    try {
        const userAgent = req.useragent;
        const ip = req.clientIp;

        const deviceInfo = {
            browser: userAgent.browser,
            version: userAgent.version,
            os: userAgent.os,
            platform: userAgent.platform,
            source: userAgent.source,
            ip: ip
        };
        console.log("deviceInfo:", deviceInfo)

        let { email, phone, password } = req.body
        let user = await User.findOne({
            email: { $ne: null, $eq: email },
            isActive: true
        }).populate({ path: 'role', model: Staff })
        if (!user) {
            user = await User.findOne({
                phone: { $ne: null, $eq: phone },
                isActive: true
            }).populate({ path: 'role', model: Staff })
        }
        if (!user) { return sendError(res, 'your role is not valid. access denied.', 403) }
        const match = await argon2.verify(user.password, password)
        if (!match) { return sendError(res, 'wrong pass') }
        const tokens = await createTokenPair({ userId: user._id, role: user.role.staff_type, roleId: user.role._id }, "publicKey", "privateKey")
        await createKeyToken(user._id, deviceInfo, tokens.refreshToken, "privateKey", "publicKey")
        const response = await {
            "status": "Logged in",
            "accessToken": tokens.accessToken,
            "refreshToken": tokens.refreshToken,
        }
        return sendSuccess(res, 'login successfully.', response)
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route POST /api/auth/new-token
 * @description get new token
 * @access public
 */
authRoute.post('/new-token', async (req, res) => {
    try {
        const userAgent = req.useragent;
        const ip = req.clientIp;

        const deviceInfo = {
            browser: userAgent.browser,
            version: userAgent.version,
            os: userAgent.os,
            platform: userAgent.platform,
            source: userAgent.source,
            ip: ip
        };
        console.log("deviceInfo:", deviceInfo)
        const refreshToken = await req.headers['x-refresh-token']
        if (!refreshToken) { return sendError(res, 'No token provided'); }
        const decodedToken = await jwt.verify(refreshToken, "privateKey")
        if (!decodedToken) { return sendError(res, 'Fail'); }
        const rTkn = await KeyToken.findOne({ user: decodedToken.userId });
        const check = await rTkn.refreshTokenUsed.every((token) => token.deviceInfo !== deviceInfo.ip)
        if (!rTkn || check === true) {
            console.log("deviceInfo:", deviceInfo.ip)
            return sendError(res, 'Refresh token not found');
        }
        const date = await new Date(decodedToken.exp * 1000)
        const expiresIn = await Math.floor((date.getTime() - Date.now()) / 1000);
        const user = await User.findById(decodedToken.userId).populate({ path: 'role', model: Staff })
        if (!user) { return sendError(res, 'Not found user'); }
        const tokens = await createNewTokenPair({ userId: user._id, role: user.role.staff_type }, "publicKey", "privateKey", expiresIn)
        await createKeyToken(user._id, deviceInfo, tokens.refreshToken, "privateKey", "publicKey")
        const response = await {
            "accessToken": tokens.accessToken,
            "refreshToken": tokens.refreshToken,
        }
        return sendSuccess(res, 'successfully.', response)
    } catch (err) {
        console.log(err)
        return sendServerError(res)
    }
})

/**
 * @route POST /api/auth/forgot-pw
 * @description forgot password feature for customer
 * @access public
 */
authRoute.post('/forgot-pw', async (req, res) => {
    const errors = userForgotPw(req.body)
    if (errors) return sendError(res, errors)

    let { email, phone } = req.body
    try {
        let user = await User.findOne({
            email: { $ne: null, $eq: email },
            isActive: true
        })
        if (user) {
            user = await User.findOne({
                phone: { $ne: null, $eq: phone },
                isActive: true
            })
        }
        if (!user) return sendError(res, 'email/phone doesn\'t exist.', 404)

        const newPw = await renewPw()
        if (email) {
            const options = {
                from: process.env.MAIL_HOST,
                to: email,
                subject: '[noreply-Logistics Webapp] Quên mật khẩu',
                html: `<p>Mật khẩu mới của bạn là: <i><b>${newPw}</b></i></p>`
            }
            const sendMailSuccess = await sendAutoMail(options)
            if (!sendMailSuccess) return sendError(res, 'send new password failed.')
        }
        else if (phone) {
            const options = {
                from: process.env.PHONE_NUMBER,
                to: phone,
                body: `Mật khẩu mới của bạn là: ${newPw}`
            }
            const sendSMSSuccess = await sendAutoSMS(options)
            if (!sendSMSSuccess) return sendError(res, 'send new password failed.')
        }

        const argon2_newPw = await argon2.hash(newPw)
        await User.findByIdAndUpdate(user.id, { password: argon2_newPw })
        return sendSuccess(res, 'generate new password successfully.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route PUT /api/auth/change-pw
 * @description user change current password
 * @access private
 */
authRoute.put('/change-pw', verifyToken, async (req, res) => {
    const errors = userChangePw(req.body)
    if (errors) return sendError(res, errors)

    const { oldPw, newPw } = req.body
    try {
        const user = await User.findById(req.decoded.userId)

        const pwValid = await argon2.verify(user.password, oldPw)
        if (!pwValid) return sendError(res, 'current password isn\'t correct.')

        const argon2_newPw = await argon2.hash(newPw)
        await User.findByIdAndUpdate(req.decoded.userId, { password: argon2_newPw })
        return sendSuccess(res, 'change your password successfully.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route POST /api/auth/logout
 * @description user log out
 * @access private
 */
authRoute.post('/logout', verifyToken, async (req, res) => {
    const { refreshToken } = req.body
    if (refreshToken in TOKEN_LIST)
        delete TOKEN_LIST[refreshToken]
    else return sendError(res, 'refresh token is invalid.', 401)
    try {
        jwt.verify(req.verifyToken, process.env.JWT_SECRET_KEY, {
            complete: true
        })
        TOKEN_BLACKLIST[req.verifyToken] = req.verifyToken
        clearTokenList(TOKEN_BLACKLIST)
    } catch (error) { }
    return sendSuccess(res, 'log out successfully. see you soon.')
})

export default authRoute
