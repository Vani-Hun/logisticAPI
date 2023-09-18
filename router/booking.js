import express from "express"
import { sendError, sendServerError, sendSuccess } from "../helper/client.js"
import { createBookingValidate } from "../validation/booking.js"
import Booking from "../model/Booking.js";

const bookingRoute = express.Router()

/**
 * @route POST /api/booking/
 * @description create new a booking
 * @access public
 */
bookingRoute.post('/', async (req, res) => {
    try {
        const errors = createBookingValidate(req.body)
        if (errors) return sendError(res, errors)
        const { customerName, contactInfo, pickupAddress, deliveryAddress, pickupDate, deliveryDate, products, status } = req.body
        if(!customerName) return sendError(res, 'Please provide a customer name.')
        if(!pickupAddress) return sendError(res, 'Please provide a pickup address.')
        if(!deliveryAddress) return sendError(res, 'Please provide a delivery address.')
        if(!pickupDate) return sendError(res, 'Please provide a pickup date.')
        if(!deliveryDate) return sendError(res, 'Please provide a delivery date.')
        const booking = await Booking.create({customerName, contactInfo, pickupAddress, deliveryAddress, pickupDate, deliveryDate, products, status})
        return sendSuccess(res, 'Create new booking successfully.', booking)
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route PUT api/booking/:idBooking
 * @description update a booking by id
 * @access public
 */
bookingRoute.put('/:idBooking', async (req, res) => {
    try {
        const { idBooking } = req.params
        if(!idBooking.match(/^[0-9a-fA-F]{24}$/)) {
            return sendError(res, 'ID booking does not exist.')
        }
        const { customerName, contactInfo, pickupAddress, deliveryAddress, pickupDate, deliveryDate, products, status } = req.body
        const booking = await Booking.findByIdAndUpdate(idBooking, {
            customerName: customerName, 
            contactInfo: contactInfo, 
            pickupAddress: pickupAddress, 
            deliveryAddress: deliveryAddress, 
            pickupDate: pickupDate, 
            deliveryDate: deliveryDate, 
            products: products, 
            status: status
        })
        if(booking) return sendSuccess(res, 'Update information of booking successfully.', {
            _id: idBooking,
            customerName: customerName, 
            contactInfo: contactInfo, 
            pickupAddress: pickupAddress, 
            deliveryAddress: deliveryAddress, 
            pickupDate: pickupDate, 
            deliveryDate: deliveryDate, 
            products: products, 
            status: status
        })
        return sendError(res, 'Id booking does not exist.')
    } catch (error) {
        console.log(error)
        return sendError(res)
    }
})

/**
 * @route DELETE api/booking/:idBooking
 * @description delete a booking by id
 * @access public
 */
bookingRoute.delete('/:idBooking', async (req, res) => {
    try {
        const { idBooking } = req.params
        if (!idBooking.match(/^[0-9a-fA-F]{24}$/)) {
            return sendError(res, 'Id booking does not exist.')
        }
        const booking = await Booking.findByIdAndDelete({_id: idBooking})
        if(booking){
            return sendSuccess(res, 'Delete booking successfully.', booking)
        }
        return sendError(res, 'Id booking does not exist.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

export default bookingRoute