import express from "express"
import { unlinkSync } from "fs"
import { uploadImg } from "../../middleware/storage.js"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import { createFeatureDir } from "../../middleware/createDir.js"
import Feature from "../../model/Feature.js"
import DeliveryService from "../../model/DeliveryService.js"
import fs from 'fs'
import { deleteSingle, uploadSingle } from "../../helper/connectCloud.js"

const featureAdminRoute = express.Router();


/**
 * @route POST /api/admin/feature/:serviceId
 * @description create details of feature
 * @access private
 */
featureAdminRoute.post('/:serviceId', createFeatureDir, uploadImg.single("logo"),
  async (req, res) => {
    try {
      const { serviceId } = await req.params
      const service = await DeliveryService.findById(serviceId)
      if (!service) { return sendError(res, "Service not exists.") }
      const { name, detail } = req.body
      const isExist = await Feature.exists({ name: name })
      if (isExist) {
        return sendError(res, "Name already exists.")
      }
      let file = await `${req.file.destination}${req.file.filename}`
      let nameImg = await req.file.fieldname + name.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/ /g, '')
      let result = await uploadSingle(file, "feature", nameImg)
      if (result) {
        fs.unlinkSync(file, (err) => {
          console.log(err)
        })
      }
      let feature = await Feature.create({ name: name, detail: detail, logo: result })
      await DeliveryService.updateOne({ _id: serviceId }, { $push: { features: feature } })
      return sendSuccess(res, 'set Feature information successfully.')
    } catch (error) {
      console.log(error)
      return sendServerError(res)
    }
  }
)

/**
 * @route POST /api/admin/feature/logo/:featureId
 * @description update img logo feature
 * @access private
 */
featureAdminRoute.put("/logo/:featureId", createFeatureDir, uploadImg.single("logo"),
  async (req, res) => {
    try {
      const { featureId } = await req.params
      const feature = await Feature.findOne({_id: featureId})
      if (!feature) { return sendError(res, "feature not exists.") }
      if (feature.logo) {
        let splitUrl = await feature.logo.split('/')
        let file = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
        await deleteSingle(file)
      }
      let file = await `${req.file.destination}${req.file.filename}`
      let nameImg = await req.file.fieldname + feature.name.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/ /g, '')
      let result = await uploadSingle(file, "feature", nameImg)
      if (result) {
        fs.unlinkSync(file, (err) => {
          console.log(err)
        })
      }
      await Feature.findByIdAndUpdate(featureId, { logo: result })
      return sendSuccess(res, "Create new img feature successfully.")
    } catch (error) {
      if (req.files) req.files.map((file) => unlinkSync(file.path))
      return sendServerError(res)
    }
  }
);
/**
 * @route POST /api/admin/feature/:featureId
 * @description update details of feature
 * @access private
 */
featureAdminRoute.put('/:featureId',
  async (req, res) => {
    try {
      const { featureId } = await req.params
      const isExist = await Feature.exists({ _id: featureId })
      if (!isExist) {
        return sendError(res, "Feature not exists.")
      }
      const { name, detail } = req.body
      await Feature.findByIdAndUpdate(featureId, { name: name, detail: detail })
      return sendSuccess(res, 'set Feature information successfully.')
    } catch (error) {
      console.log(error)
      return sendServerError(res)
    }
  }
)

/**
 * @route DELETE /api/admin/feature/:featureId
 * @description delete an existing feature
 * @access private
 */
featureAdminRoute.delete("/:featureId", async (req, res) => {
  const { featureId } = req.params
  try {
    const isExist = await Feature.findOne({_id: featureId})
    if (!isExist) return sendError(res, "Feature does not exist.")
    await DeliveryService.findOneAndUpdate({ features: featureId }, { $pull: { features: featureId } })
    let splitUrl = await isExist.logo.split('/')
    let file = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
    await deleteSingle(file)
    await Feature.findByIdAndRemove(featureId)
    return sendSuccess(res, "Delete feature successfully.")
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
});

export default featureAdminRoute