import express from "express"
import { sendError, sendServerError, sendSuccess, sendAutoMail } from "../../helper/client.js"
import CompareReview from "../../model/CompareReview.js"
import User from "../../model/User.js"
import { COD_STATUS } from "../../constant.js"
import mongoose from "mongoose"

const compareReviewAdminRoute = express.Router()

/**
 * @route GET /api/admin/compare-review/time-up
 * @description admin get all compare-review time-up
 * @access private
 */
compareReviewAdminRoute.get('/time-up',
    async (req, res) => {
        try {
            let today = new Date();
            let compareReviews = await CompareReview.find({
                selected_date: { $lte: `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}` }
            })
            return sendSuccess(res, "Admin get all compare-review time-up successfully.", compareReviews)
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

/**
 * @route GET /api/admin/compare-review
 * @description admin get all compare-review 
 * @access private
 */
compareReviewAdminRoute.get('/',
    async (req, res) => {
        try {
            let compareReviews = await CompareReview.find();
            return sendSuccess(res, "Admin get all compare-review time-up successfully.", compareReviews)
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

/**
 * @route PATCH /api/admin/compare-review/:id/do-sendgmail
 * @description admin update compareReview isSent and send gmail
 * @access private
 */
compareReviewAdminRoute.patch('/:id/do-sendgmail',
    async (req, res) => {
        let { id } = req.params;

        if (mongoose.isValidObjectId(id) == false) {
            return sendError(res, "Failed! Id params is not valid ObjectId");
        }

        try {
            let compareReview = await CompareReview.findById(id).populate("order");

            if (compareReview == null) {
                return sendError(res, "Failed! CompareReview is not exist");
            }

            let today = new Date().getTime();
            let _date = new Date(compareReview.selected_date).getTime();
            if (today < _date) {
                return sendError(res, "Failed! This compareReview is not expired");
            }

            try {
                if (compareReview.order.cod.status !== COD_STATUS.collected) {
                    return sendError(res, "Failed! order in compareReview has COD - not collected");
                }
            } catch (error) {
                return sendError(res, "Failed! order in compareReview do not have COD ");
            }


            if (compareReview.isSent == false) {
                compareReview.isSent = true;
                await compareReview.save();

                const user = await User.findOne({ role: compareReview.customer })

                let { email, phone } = user;

                const optionsToCS = {
                    from: process.env.MAIL_HOST,
                    to: email,
                    subject: "Tin nhắn liên hệ từ Logistics-Webapp",
                    html: `<p>Chào, <b>${email}</b></p>            
                    <p>Nội dung: Chúng tôi đã tiến hành đối soát với tài khoản của bạn. Bạn sẽ nhận được tiền trong 24h</p>
                    <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi.</p>
                    `
                }
                const data = await sendAutoMail(optionsToCS)
                // send mail successfully
                if (data) {
                }

                return sendSuccess(res, "Admin update compareReview isSent and send gmail successfully.", compareReview)
            }
            return sendError(res, "Failed! This compareReview is updated 1 time before")
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

/**
 * @route DELETE /api/admin/compare-review/:id
 * @description admin update compareReview orders
 * @access private
 */
compareReviewAdminRoute.delete('/:id',
    async (req, res) => {
        let { id } = req.params;

        if (mongoose.isValidObjectId(id) == false) {
            return sendError(res, "Failed! Id params is not valid ObjectId");
        }

        try {
            let compareReview = await CompareReview.findByIdAndRemove(id);

            if (compareReview == null) {
                return sendError(res, "Failed! CompareReview is not exist");
            }

            return sendSuccess(res, "Admin delete compareReview successfully.", compareReview)
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)


export default compareReviewAdminRoute