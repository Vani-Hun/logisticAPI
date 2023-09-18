import express from 'express'
import { verifyCustomer, verifyStaff, verifyToken } from '../middleware/verify.js'
import Complaint from '../model/Complaint.js';
import { sendError, sendSuccess } from '../helper/client.js';
import User from '../model/User.js';

const complaintRoute = express.Router();

/**
 *  get all complaint
 */
complaintRoute.get('/', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.decoded.userId);
        const complaints = await Complaint.find({ user: user.id }).populate({
            path: 'user',
            select: 'email'
        })

        sendSuccess(res, 'Get complaints sucessfully', complaints);
    } catch (error) {
        sendError(res, 'Get complaints error', error);
    }
})

/**
 *  create new complaint
 */
complaintRoute.post('/', verifyToken, async (req, res) => {
    try {
        const { message } = req.body;

        const complaint = new Complaint({
            message,
            user: req.decoded.userId
        })

        const newComplaint = await complaint.save();

        sendSuccess(res, 'Create complaint sucessfully', newComplaint);
    } catch (error) {
        sendError(res, 'Create complaints error', error);
    }
})

const checkPermission = async (req) => {
    const user = await User.findById(req.decoded.userId);
    const complaints = await Complaint.find({ user: user.id }).populate({
        path: 'user',
        select: 'email'
    })

    const listIdComplaints = [];

    complaints.forEach(complaint => {
        listIdComplaints.push(complaint._id.toString());
    })

    return listIdComplaints.findIndex(id => id === req.params.id);
}

/**
 *  update complaint
 */
complaintRoute.patch('/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.decoded.userId);
        if (!user) {
            return sendError(res, "User not found", 404);
        }
        const existComplaint = await Complaint.findById(req.params.id);
        if (!existComplaint) {
            return sendError(res, 'The complaint does not exist');
        }

        const { message } = req.body;

        const isAllow = await checkPermission(req);

        if (isAllow < 0) {
            return sendError(res, 'You do not have a permission', 403);
        }

        // const complaint = await Complaint.findByIdAndUpdate(req.params.id, {message}, {new: true, runValidators: true});
        existComplaint.message = message;
        await existComplaint.save();
        sendSuccess(res, 'Update complaint sucessfully', existComplaint);
    } catch (error) {
        sendError(res, 'Update complaints error', error);
    }
})

/**
 *  get complaint by id
 */
complaintRoute.get('/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.decoded.userId);
        if (!user) {
            return sendError(res, "User not found", 404);
        }
        const complaint = await Complaint.findById(req.params.id)
        if (!complaint) {
            return sendError(res, 'The complaint does not exist');
        }

        const isAllow = await checkPermission(req);

        if (isAllow < 0) {
            return sendError(res, 'You do not have a permission', 403);
        }

        sendSuccess(res, 'Get complaint sucessfully', complaint);
    } catch (error) {
        sendError(res, 'Get complaint error', error);
    }
})

/**
 *  delete complaint
 */
complaintRoute.delete('/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.decoded.userId);
        if (!user) {
            return sendError(res, "User not found", 404);
        }
        const existComplaint = await Complaint.findById(req.params.id);
        if (!existComplaint) {
            return sendError(res, 'The complaint does not exist');
        }

        const isAllow = await checkPermission(req);

        if (isAllow < 0) {
            return sendError(res, 'You do not have a permission', 403);
        }

        const complaint = await existComplaint.remove();

        sendSuccess(res, 'Delete complaint sucessfully', complaint);
    } catch (error) {
        sendError(res, 'Delete complaints error', error);
    }
})

export default complaintRoute