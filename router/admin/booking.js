import express from "express"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import Booking from "../../model/Booking.js"

const bookingAdminRoute = express.Router()

/**
 * @route GET /api/admin/booking
 * @description get all booking
 * @access private
 */
bookingAdminRoute.get("/", async (req, res) => {
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0
        const page = req.query.page ? parseInt(req.query.page) : 0
        const { keyword, sortBy, customerName, contactInfo, pickupAddress, deliveryAddress, status } = req.query
        let query = {}
        let keywordList = keyword
            ? {
                $or: [
                    { customerName: { $regex: keyword, $options: "i"} },
                    { "contactInfo.email": { $regex: keyword, $options: "i" } },
                    { "contactInfo.phone": { $regex: keyword, $options: "i" } },
                    { pickupAddress: { $regex: keyword, $options: "i" } },
                    { deliveryAddress: { $regex: keyword, $options: "i" } },
                    { status: { $regex: keyword, $options: "i" } }
                ]
            } : {}
        if(customerName){
            query.customerName = customerName
        }
        if(contactInfo){
            query.contactInfo = contactInfo
        }
        if(pickupAddress){
            query.pickupAddress = pickupAddress
        }
        if(deliveryAddress){
            query.deliveryAddress = deliveryAddress
        }
        if(status){
            query.status = status
        }
        const length = await Booking.find({ $and: [query, keywordList] }).count()
        const booking = await Booking.find({ $and: [query, keywordList] })
            .limit(pageSize)
            .skip(pageSize * page)
            .sort(`${sortBy}`)
        if (booking) {
            return sendSuccess(res, 'Get booking information successfully.', {
                length,
                booking
            })
        }
        return sendError(res, 'Booking information is not found.')   
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route GET /api/booking/:idBooking
 * @description get booking by id
 * @access private
 */
bookingAdminRoute.get('/:idBooking', async (req, res) => {
    try {
        const { idBooking } = req.params
        if(!idBooking.match(/^[0-9a-fA-F]{24}$/)){
            return sendError(res, 'Id Booking does not exist.')
        }
        const booking = await Booking.findById({_id: idBooking})
        if(!booking) return sendError(res, 'ID Booking does not exist.')
        return sendSuccess(res, 'Get booking by ID successfully.', booking)
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

export default bookingAdminRoute