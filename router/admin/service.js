import express from "express";
import { unlinkSync, unlink } from "fs";
import { uploadImg } from "../../middleware/storage.js"
import { sendError, sendServerError, sendSuccess, } from "../../helper/client.js";
import { createDeliveryServiceDir } from "../../middleware/createDir.js";
import DeliveryService from "../../model/DeliveryService.js";
import { createServiceValidate } from "../../validation/service.js";
import fs from 'fs'
import { deleteSingle, uploadSingle } from "../../helper/connectCloud.js"
import Participant from "../../model/Participant.js";

const serviceAdminRoute = express.Router();

/**
 * @route POST /api/admin/service/
 * @description create new delivery service
 * @access private
 */
serviceAdminRoute.post("/", async (req, res) => {
  const errors = createServiceValidate(req.body);
  if (errors) return sendError(res, errors);
  let { name, sub_detail, target, tip, video, introduce } = req.body;
  try {
    const isExist = await DeliveryService.exists({ name });
    if (isExist) {
      return sendError(res, "This service is already existed.");
    }
    const service = await DeliveryService.create({ name, sub_detail, target, tip, video, introduce });
    return sendSuccess(res, "Create new service successfully.", service);
  } catch (error) {
    return sendServerError(res);
  }
});

/**
 * @route POST /api/admin/service/banner/serviceId
 * @description create/update service banner
 * @access private
 */
serviceAdminRoute.post("/banner/:serviceId", createDeliveryServiceDir, uploadImg.single("banner"),
  async (req, res) => {
    try {
      const { serviceId } = await req.params;
      const isExist = await DeliveryService.findById({ _id: serviceId })
      if (isExist) {
        if (isExist.banner) {
          let splitUrl = await isExist.banner.split('/')
          let file = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
          await deleteSingle(file)
        }
        let file = await `${req.file.destination}${req.file.filename}`
        let name = await req.file.fieldname + isExist.name.normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd').replace(/Đ/g, 'D')
          .replace(/ /g, '')
        let result = await uploadSingle(file, "deliveryService", name)
        if (result) {
          fs.unlinkSync(file, (err) => {
            console.log(err)
          })
        }
        await DeliveryService.findOneAndUpdate({ _id: serviceId }, { banner: result });
        return sendSuccess(res, "Upload banner successfully.")
      } else { return sendError(res, "Not found") }
    } catch (error) {
      if (req.file) unlinkSync(req.file.path);
      return sendServerError(res);
    }
  }
);

/**
 * @route POST /api/admin/service/subbanner/serviceId
 * @description create/update service subbanner
 * @access private
 */
serviceAdminRoute.post("/subbanner/:serviceId", createDeliveryServiceDir, uploadImg.single("sub_banner"),
  async (req, res) => {
    try {
      const { serviceId } = await req.params;
      const isExist = await DeliveryService.findById({ _id: serviceId })
      if (isExist) {
        if (isExist.sub_banner) {
          let splitUrl = await isExist.sub_banner.split('/')
          let file = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
          await deleteSingle(file)
        }
        let file = await `${req.file.destination}${req.file.filename}`
        let name = await req.file.fieldname + isExist.name.normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd').replace(/Đ/g, 'D')
          .replace(/ /g, '')
        let result = await uploadSingle(file, "deliveryService", name)
        if (result) {
          fs.unlinkSync(file, (err) => {
            console.log(err)
          })
        }
        await DeliveryService.findOneAndUpdate({ _id: serviceId }, { sub_banner: result })
        return sendSuccess(res, "Upload sub_banner successfully.")
      } else { return sendError(res, "Not found") }

    } catch (error) {
      if (req.file) unlinkSync(req.file.path);
      return sendServerError(res);
    }
  }
);

/**
 * @route POST /api/admin/service/quotebanner/serviceId
 * @description create/update service quote_banner
 * @access private
 */
serviceAdminRoute.post("/quotebanner/:serviceId", createDeliveryServiceDir, uploadImg.single("quote_banner"),
  async (req, res) => {
    try {
      const { serviceId } = await req.params;
      const isExist = await DeliveryService.findById({ _id: serviceId })
      if (isExist) {
        if (isExist.quote_banner) {
          let splitUrl = await isExist.quote_banner.split('/')
          let file = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
          await deleteSingle(file)
        }
        let file = await `${req.file.destination}${req.file.filename}`
        let name = await req.file.fieldname + isExist.name.normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd').replace(/Đ/g, 'D')
          .replace(/ /g, '')
        let result = await uploadSingle(file, "deliveryService", name)
        if (result) {
          fs.unlinkSync(file, (err) => {
            console.log(err)
          })
        }
        await DeliveryService.findOneAndUpdate({ _id: serviceId }, { quote_banner: result })
        return sendSuccess(res, "Upload quote_banner successfully.")
      } else { return sendError(res, "Not found") }

    } catch (error) {
      if (req.file) unlinkSync(req.file.path);
      return sendServerError(res);
    }
  }
);

/**
 * @route POST /api/admin/service/bottombanner/serviceId
 * @description create/update service bottom_banner
 * @access private
 */
serviceAdminRoute.post("/bottombanner/:serviceId", createDeliveryServiceDir, uploadImg.single("bottom_banner"),
  async (req, res) => {
    try {
      const { serviceId } = await req.params;
      const isExist = await DeliveryService.findById({ _id: serviceId })
      if (isExist) {
        if (isExist.bottom_banner) {
          let splitUrl = await isExist.bottom_banner.split('/')
          let file = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
          await deleteSingle(file)
        }
        let file = await `${req.file.destination}${req.file.filename}`
        let name = await req.file.fieldname + isExist.name.normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd').replace(/Đ/g, 'D')
          .replace(/ /g, '')
        let result = await uploadSingle(file, "deliveryService", name)
        if (result) {
          fs.unlinkSync(file, (err) => {
            console.log(err)
          })
        }
        await DeliveryService.findOneAndUpdate({ _id: serviceId }, { bottom_banner: result });
        return sendSuccess(res, "Upload sub_banner successfully.");
      } else { return sendError(res, "Not found") }
    } catch (error) {
      if (req.file) unlinkSync(req.file.path);
      return sendServerError(res);
    }
  }
);

/**
 * @route POST /api/admin/service/logo/:servcieId
 * @description create/update service logo
 * @access private
 */
serviceAdminRoute.post("/logo/:serviceId", createDeliveryServiceDir, uploadImg.single("logo"), async (req, res) => {
  try {
    const { serviceId } = await req.params;
    const isExist = await DeliveryService.findById({ _id: serviceId })
    if (isExist) {
      if (isExist.logo) {
        let splitUrl = await isExist.logo.split('/')
        let file = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
        await deleteSingle(file)
      }
      let file = await `${req.file.destination}${req.file.filename}`
      let name = await req.file.fieldname + isExist.name.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/ /g, '')
      let result = await uploadSingle(file, "deliveryService", name)
      if (result) {
        fs.unlinkSync(file, (err) => {
          console.log(err)
        })
      }
      await DeliveryService.findOneAndUpdate({ _id: serviceId }, { logo: result });
      return sendSuccess(res, "Upload logo successfully.");
    } else { return sendError(res, "Not found") }
  } catch (error) {
    if (req.file) unlinkSync(req.file.path);
    return sendServerError(res);
  }
}
);

/**
 * @route POST /api/admin/service/participant/:serviceId
 * @description create a new participant
 * @access private
 */
serviceAdminRoute.post('/participant/:serviceId', async (req, res) => {
  try {
    const { name_detail } = req.body;
    const { serviceId } = req.params;
    const participant = await Participant.findOne({ name_detail: name_detail });
    if (!participant) { return sendError(res, "Participant does not exist.") }
    const service = await DeliveryService.findOneAndUpdate({ _id: serviceId }, { $push: { participants: participant._id } })
    return sendSuccess(res, 'Set participant successfully.')
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
}
)

/**
 * @route PUT /api/admin/service/:id
 * @description update content of service by serviceId
 * @access private
 */
serviceAdminRoute.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const isExist = await DeliveryService.exists({ _id: id });
    if (!isExist) return sendError(res, "Service does not exist.");

    const { name, sub_detail, target, tip, video, introduce } = req.body;

    await DeliveryService.findByIdAndUpdate(id, { name: name, sub_detail: sub_detail, target: target, tip: tip, video: video, introduce: introduce }).then(() => {
      return sendSuccess(res, "Update service successfully.");
    }).catch((err) => {
      return sendError(res, err);
    });
  } catch (error) {
    return sendServerError(res);
  }
});

/**
 * @route DELETE /api/admin/service/participant/:serviceId
 * @description delete a existing service
 * @access private
 */
serviceAdminRoute.delete("/participant/:serviceId", async (req, res) => {
  try {
    const { serviceId } = req.params
    const { name_detail } = req.body
    let participant = await Participant.findOne({ name_detail: name_detail })
    if (!participant) { return sendError(res, "Participant does not exist."); }
    await DeliveryService.findByIdAndUpdate(serviceId, { $pull: { participants: participant._id } })
    return sendSuccess(res, "Delete participant successfully.")
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
});

/**
 * @route DELETE /api/admin/service/:serviceId
 * @description delete a existing service
 * @access private
 */
serviceAdminRoute.delete("/:serviceId", async (req, res) => {
  const { serviceId } = req.params
  try {
    const isExist = await DeliveryService.findById(serviceId);
    if (!isExist) return sendError(res, "Service does not exist.");
    if (isExist.logo) {
      let pathLogo = isExist.logo.split('/');
      let nameLogo = pathLogo[pathLogo.length - 1].split('.')[0];
      let fileLogo = pathLogo[pathLogo.length - 2] + '/' + nameLogo;
      await deleteSingle(fileLogo);
    }
    if (isExist.banner) {
      let pathBanner = isExist.banner.split('/');
      let nameBanner = pathBanner[pathBanner.length - 1].split('.')[0];
      let fileBanner = pathBanner[pathBanner.length - 2] + '/' + nameBanner;
      await deleteSingle(fileBanner);
    }
    if (isExist.sub_banner) {
      let pathBanner = isExist.sub_banner.split('/');
      let nameBanner = pathBanner[pathBanner.length - 1].split('.')[0];
      let fileBanner = pathBanner[pathBanner.length - 2] + '/' + nameBanner;
      await deleteSingle(fileBanner);
    }
    if (isExist.quote_banner) {
      let pathBanner = isExist.quote_banner.split('/');
      let nameBanner = pathBanner[pathBanner.length - 1].split('.')[0];
      let fileBanner = pathBanner[pathBanner.length - 2] + '/' + nameBanner;
      await deleteSingle(fileBanner);
    }
    if (isExist.bottom_banner) {
      let pathBanner = isExist.bottom_banner.split('/');
      let nameBanner = pathBanner[pathBanner.length - 1].split('.')[0];
      let fileBanner = pathBanner[pathBanner.length - 2] + '/' + nameBanner;
      await deleteSingle(fileBanner);
    }

    await DeliveryService.findByIdAndRemove(serviceId)
    return sendSuccess(res, "Delete service successfully.");
  } catch (error) {
    return sendServerError(res);
  }
});

export default serviceAdminRoute;
