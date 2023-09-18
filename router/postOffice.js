import express from "express"
import PostOffice from "../model/PostOffice.js"
import { sendError, sendServerError, sendSuccess } from "../helper/client.js"
import { SearchPostOfficeValidate } from "../validation/postOffice.js"

const postOfficeRoute = express.Router();

/**
 * @route GET /api/post-office/search
 * @description get postOffice
 * @access public
 */
postOfficeRoute.get("/search", async (req, res) => {
    try {
        const err = await SearchPostOfficeValidate(req.query);
        if (err)
            return sendError(res,err);
        const { province, district } = req.query
        let arrayPostOffice = [];
        let sum = 0;
        if (district === ""){
            const postOffices = await PostOffice.find({ province: province })
            if(postOffices.length === 0) 
                return sendError(res, "No post office found")
            sum = postOffices.length;
            postOffices.forEach((item) => {
                let office = {
                    name: item.name,
                    province: item.province,
                    district: item.district,
                    ward: item.ward,
                    address: item.address
                };
                arrayPostOffice.push(office);
            });
        }
        const postOffices = await PostOffice.find({ province: province, district: district })
        if(postOffices.length === 0) 
            return sendError(res, "No post office found")
        sum = postOffices.length;
        postOffices.forEach((item) => {
            let office = {
                name: item.name,
                province: item.province,
                district: item.district,
                ward: item.ward,
                address: item.address
            };
            arrayPostOffice.push(office);
        });
        return sendSuccess(res, "Add postOffice successfully.", 
            {
                Count: sum,
                data: arrayPostOffice
            }
        );
        
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
})

export default postOfficeRoute;