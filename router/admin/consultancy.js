import express from "express"
import { sendError, sendServerError, sendAutoMail, sendSuccess } from "../../helper/client.js"
import Consultancy from "../../model/Consultancy.js"
import DeliveryService from "../../model/DeliveryService.js"
import CustomerAppointment from "../../model/CustomerAppointment.js"
const consultancyAdminRoute = express.Router()

/**
 * @route GET /api/admin/consultancy
 * @description Get list of consultancy (all or paging)
 * @access private
 */
consultancyAdminRoute.get('/', async (req, res) => {
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0
        const page = req.query.page ? parseInt(req.query.page) : 0
        const { keyword, sortBy, status } = req.query
        let keywordCondition = keyword ? {
            $or: [

                { name: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } },
                { phone: { $regex: keyword, $options: 'i' } },
                { service: { $regex: keyword, $options: 'i' } },
                { province: { $regex: keyword, $options: 'i' } },
                { ward: { $regex: keyword, $options: 'i' } },
                { district: { $regex: keyword, $options: 'i' } },
                { parcel: { $regex: keyword, $options: 'i' } }

            ]
        } : {}
        let filterCondition = status ? { solved_status: status } : {}
        const consultancy = await Consultancy.find(
            {
                $and: [
                    filterCondition,
                    keywordCondition
                ]
            }
        )
            .limit(pageSize).skip(pageSize * page).sort(`${sortBy}`)
        const length = await Consultancy.find(
            {
                $and: [
                    filterCondition,
                    keywordCondition
                ]
            }
        ).count()
        if (consultancy)
            return sendSuccess(res, 'Get consultancy information successfully.', { length, consultancy })
        return sendError(res, 'Consultancy information is not found.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route GET /api/admin/consultancy/:id
 * @description get a consultancy by id
 * @access 
 */
consultancyAdminRoute.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const consultancy = await Consultancy.findOne({_id: id})
        if (consultancy)
            return sendSuccess(res, 'Get consultancy information successfully.', consultancy)
        return sendError(res, 'Consultancy information is not found.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route PUT /api/admin/consultancy/:id
 * @description update information of a consultancy
 * @access private
 */
consultancyAdminRoute.put('/:id',
    async (req, res) => {
        try {
            const { id } = req.params
            const { service, name, email, phone, district, province, ward, fulladdress, parcel, quantity, solved_status } = req.body
            const isExist = await Consultancy.exists({ _id: id })
            if (!isExist) return sendError(res, "This consultancy is not existed.")

            if (service) {
                const isExistService = await DeliveryService.exists({ name: service })
                if (!isExistService) return sendError(res, 'The service is not existed.')
            }
            await Consultancy.findByIdAndUpdate(id, { $set: { service, name, email, phone, district, province, ward, fulladdress, parcel, quantity, solved_status } })
            return sendSuccess(res, "Update consultancy successfully.", { service, name, email, phone, district, province, ward, fulladdress, parcel, quantity, solved_status })
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

/**
 * @route DELETE /api/admin/consultancy/:id
 * @description delete a existing consultancy
 * @access private
 */
consultancyAdminRoute.delete('/:id',
    async (req, res) => {
        try {
            const { id } = req.params;
            const isExist = await Consultancy.exists({ _id: id })
            if (!isExist) return sendError(res, "Consultancy does not exist.")
            await Consultancy.findByIdAndRemove(id)
            return sendSuccess(res, "Delete successfully.")
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

consultancyAdminRoute.get("/appointment/list", async (req, res) => {
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0
        const page = req.query.page ? parseInt(req.query.page) : 0
        const { keyword, sortBy, status } = req.query
        let keywordCondition = keyword ? {
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } },
                { phone: { $regex: keyword, $options: 'i' } }
            ]
        } : {}
        let filterCondition = status ? { solved_status: status } : {}
        const appointment = await CustomerAppointment.find(
            {
                $and: [
                    filterCondition,
                    keywordCondition
                ]
            }
        )
            .limit(pageSize).skip(pageSize * page).sort(`${sortBy}`);
        const length = await CustomerAppointment.find(
            {
                $and: [
                    filterCondition,
                    keywordCondition
                ]
            }
        ).count();
        if (appointment)
            return sendSuccess(res, 'Get appointment information successfully.', { length, appointment });
        return sendError(res, 'Appointment information is not found.');
    } catch (err) {
        console.log(err);
        sendServerError(err);
    }
});

consultancyAdminRoute.put("/appointment/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { customer, description, solved_status, time } = req.body;
        const isExist = await CustomerAppointment.exists({ _id: id });

        if (isExist) {
            await CustomerAppointment.findByIdAndUpdate(id, { customer, description, solved_status, time });
            return sendSuccess(res, "Update appointment information successful")
        }
        sendError(res, "Appointment is not found");
    } catch (err) {
        console.log(err);
        sendServerError(err);
    }
})

export default consultancyAdminRoute