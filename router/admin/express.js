import express from "express";
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import Express from "../../model/Express.js";

const expressAdminRoute = express.Router()
/**
 * @route GET /api/admin/express/provinces/:serviceType
 * @description user get all faqs with filter by keyword
 * @access private
 */
expressAdminRoute.get('/provinces/:serviceType', async (req, res) => {
    const serviceType = req.params.serviceType;

    try {
        const shippingPriceList = await Express.findOne({ [serviceType]: { $exists: true } }); 
        if (!shippingPriceList) {
            return sendError(res,"Shipping price list not found", 404)
        }
        const serviceData = shippingPriceList[serviceType];
        if (!serviceData) {
            return sendError(res,`Service type ${serviceType} not found`, 404)
        }
        const provinces = Object.keys(serviceData[0]._doc).map(provinceName => {
        const provinceInfo = serviceData[0]._doc[provinceName];
        return {
            provinceName: provinceInfo.name,
        };
        }).filter(province => province.provinceName);
        return sendSuccess(res, "Successfully", provinces)
    } catch (error) {
        console.error(error);
        return sendServerError(res)
    }
});
/**
 * @route PUT /api/admin/express/update-cost/:serviceType/:provinceId
 * @description user get all faqs with filter by keyword
 * @access private
 */
expressAdminRoute.put('/update-cost/:serviceType/:province', async (req, res) => {
  const { serviceType, province } = req.params;
  const { level2Id, newCost } = req.body;
    try {
        const shippingPriceList = await Express.findOne({ [serviceType]: { $exists: true } }); 
        if (!shippingPriceList) {
          return sendError(res, "Shipping price list not found", 404);
        }

        const serviceData = shippingPriceList[serviceType];
        if (!serviceData) {
          return sendError(res, `Service type ${serviceType} not found`, 404);
        }

        if (province) {
          const provinceInfo = serviceData[0]._doc[province];
          if (!provinceInfo) {
            return sendError(res, `Province ${province} not found in ${serviceType}`, 404);
          }

          const data = {
            level2s: serviceData[0]._doc[province].level2s,
            cities: serviceData[0]._doc[province].cities
          };

          const foundService = data.level2s.find(service => service.level2_id === level2Id);
          if (!foundService) {
            return sendError(res, `Service with level2Id ${level2Id} not found in ${province}`, 404);
          }
          const updatedata= await Express.updateOne(
            { '_id': shippingPriceList._id, [`${serviceType}.${province}.level2s.level2_id`]: level2Id },
            { $set: { [`${serviceType}.${province}.level2s.$.cost`]: newCost } }
          );

          return sendSuccess(res, "Successfully updated cost for service", updatedata);
        } else {
          const provinces = Object.keys(serviceData[0]._doc).map(provinceName => {
            const provinceInfo = serviceData[0]._doc[provinceName];
            return { provinceName, provinceInfo };
          });

          return sendSuccess(res, "Successfully", provinces);
        }
      } catch (error) {
        console.error(error);
        return sendServerError(res)
      }
});



export default expressAdminRoute;