import express from "express";
import {
  sendError,
  sendServerError,
  sendSuccess,
} from "../../helper/client.js";
import Career from "../../model/Career.js";
import { careerValidate } from "../../validation/career.js";
import Department from "../../model/Department.js";
const careerAdminRoute = express.Router();

/**
 * @route GET /api/admin/career/
 * @description Get list career
 * @access private
 */

careerAdminRoute.get('/', async (req, res) => {
  try {
    const careers = await Career.find();
    if (careers.length < 1) return sendError("No career yet.");
    return sendSuccess(res, "Get list career succedful", careers);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});
/**
 * @route POST /api/admin/career/create
 * @description create new career and add career to department
 * @access private
 */
careerAdminRoute.post("/create", async (req, res) => {
  try {
    const errors = careerValidate(req.body)
    if (errors) return sendError(res, errors)

    let { departmentId,
      applicationPosition,
      industry,
      position,
      title,
      deadline,
      salary,
      workingHours,
      addressDescription,
      address,
      benefits,
      jobDescription,
      jobRequirements,
      perks,
      isHot,
      isNew,
      isPublished } = req.body

    if (!departmentId.match(/^[0-9a-fA-F]{24}$/) && departmentId != null) {
      return sendError(res, "Department does not exist.")
    }

    const departments = await Department.find()
    if (!departments) return sendError(res, 'Department does not exist.')

    const career = await Career.create({
      applicationPosition,
      industry,
      position,
      title,
      deadline,
      salary,
      workingHours,
      addressDescription,
      address,
      benefits,
      jobDescription,
      jobRequirements,
      perks,
      isHot,
      isNew,
      isPublished
    })

    const updateCareer = await Department.findOneAndUpdate(
      { _id: departmentId },
      { $push: { careers: career } }
    )
    if (!updateCareer) return sendError(res, "Create career fail.")
    return sendSuccess(res, "Create new career successfully.", career)
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

/**
 * @route PUT /api/admin/career/:id
 * @description update details of an existing career
 * @access private
 */
careerAdminRoute.put("/:id", async (req, res) => {
  const { id } = req.params;
  const errors = careerValidate(req.body);
  if (errors) return sendError(res, errors);
  let { applicationPosition,
    industry,
    position,
    title,
    deadline,
    salary,
    workingHours,
    addressDescription,
    address,
    benefits,
    jobDescription,
    jobRequirements,
    perks,
    isHot,
    isNew, } = req.body;
  if (!id.match(/^[0-9a-fA-F]{24}$/))
    return sendError(res, "Distance information is not found.")
  try {
    const careers = await Career.exists({ _id: id });
    console.log("careers", careers)
    if (!careers)
      return sendError(res, "Career does not exist.");
    await Career.findByIdAndUpdate(id, {
      applicationPosition: applicationPosition,
      industry: industry,
      position: position,
      title: title,
      deadline: deadline,
      salary: salary,
      workingHours: workingHours,
      addressDescription: addressDescription,
      address: address,
      benefits: benefits,
      jobDescription: jobDescription,
      jobRequirements: jobRequirements,
      perks: perks,
      isHot: isHot,
      isNew: isNew,
    });
    return sendSuccess(res, "Update career successfully.", {
      applicationPosition: applicationPosition,
      industry: industry,
      position: position,
      title: title,
      deadline: deadline,
      salary: salary,
      workingHours: workingHours,
      addressDescription: addressDescription,
      address: address,
      benefits: benefits,
      jobDescription: jobDescription,
      jobRequirements: jobRequirements,
      perks: perks,
      isHot: isHot,
      isNew: isNew,
    });
  } catch (error) {
    return sendServerError(res);
  }
});

/**
 * @route DELETE /api/admin/career/:id
 * @description delete an existing career
 * @access private
 */
careerAdminRoute.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("id", id)
  if (!id.match(/^[0-9a-fA-F]{24}$/))
    return sendError(res, "Distance information is not found.")
  try {
    const career = await Career.exists({ _id: id });
    if (!career)
      return sendError(res, "Career does not exist.");
    await Career.findByIdAndRemove(id)
    return sendSuccess(res, "Delete career successfully.", career);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});
export default careerAdminRoute;
