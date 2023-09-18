import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from "body-parser";
import { calculateShippingExpressCost } from "../helper/caculatorCost.js"
import { autocompeleteAddress } from "../helper/autocompleteAddress.js"
import { FUEL_FEE } from "../constant.js";
import { sendError, sendServerError, sendSuccess } from "../helper/client.js"
import Fee from "../model/Fee.js";
import Express from "../model/Express.js";
const app = express();
app.use(bodyParser.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const filePath = path.join(__dirname, '..', 'data', 'dvhcvn.json');

router.post('/suggest/start-point', (req, res) => {
    const { keyword } = req.body;
    autocompeleteAddress(keyword, res);
});
router.post('/suggest/end-point', (req, res) => {
    const { keyword } = req.body;
    autocompeleteAddress(keyword, res);
});

router.post('/shipping-cost', async (req, res) => {
    try {
        let code_area1 = '';
        let code_area2 = '';
        let fromCity = '';
        let toCity = '';
        let key = '';
        let shipCost = [];
        let checkInOut = '';
        const weight = req.body.weight;
        const shippingtype = req.body.shippingtype;
        const locationString1 = req.body.name1;
        const locationString2 = req.body.name2;

        const cityName1 = locationString1.slice(locationString1.lastIndexOf(",") + 1);
        const cityName2 = locationString2.slice(locationString2.lastIndexOf(",") + 1);

        if (locationString1 == '' || locationString2 == '' || weight == 0 || shippingtype == '') {
            return sendError(res, "Please enter full information.");
        }

        const data = JSON.parse(fs.readFileSync(filePath));
        data.forEach((level1) => {
            const level1Name = level1.name.toLowerCase();
            if (level1Name.includes(cityName1.toLowerCase())) {
                fromCity = level1.code_name;
                return;
            }
        });
        data.forEach((level1) => {
            const level1Name2 = level1.name.toLowerCase();
            if (level1Name2.includes(cityName2.toLowerCase())) {
                toCity = level1.code_name;
                return;
            }
        });

        const shippingPriceList = await Express.findOne({}); 
        if (shippingtype == 'EXPRESS'){
            shippingPriceList.Standard[0]._doc[fromCity].cities.forEach((city) => {
                if (city.code_name.includes(toCity)){
                    code_area2 = city.code_area;
                    return;
                }
            });
            code_area1 = shippingPriceList.Standard[0]._doc[fromCity].code_area;
            key = `${code_area1}-${code_area2}`;
            shippingPriceList.Standard[0]._doc[fromCity].level2s.forEach((level2) => {
                if (level2.level2_id.includes(key)) {
                    shipCost = level2.cost;
                    return;
                }
            });
        }else if (shippingtype == 'FAST'){
            shippingPriceList.FastFee[0]._doc[fromCity].cities.forEach((city) => {
                if (city.code_name.includes(toCity)){
                    code_area2 = city.code_area;
                    return;
                }
            });
            code_area1 = shippingPriceList.FastFee[0]._doc[fromCity].code_area;
            key = `${code_area1}-${code_area2}`;
            shippingPriceList.FastFee[0]._doc[fromCity].level2s.forEach((level2) => {
                if (level2.level2_id.includes(key)) {
                    shipCost = level2.cost;
                    return;
                }
            });
        }else if (shippingtype == 'SUPER'){
            if (weight > 10){
                return sendError(res, "Weight is not allowed to be more than 10kg.");
            }
            const district2 = locationString2.slice(locationString2.indexOf(",")+1,locationString2.lastIndexOf(","));
            if (!shippingPriceList.SuperFee[0]._doc[fromCity])
                return sendError(res, "Super delivery is not available to this city")
            shippingPriceList.SuperFee[0]._doc[fromCity].cities.forEach((city) => {
                if (city.code_name.includes(toCity)) {
                    code_area2 = city.code_area;
                    if (city.In.toLowerCase().includes(district2.toLowerCase())){
                        checkInOut = 'In';
                    }
                    else {
                        if (city.Out.toLowerCase().includes(district2.toLowerCase()))
                            checkInOut = 'Out';
                        else 
                            checkInOut = 'None';
                    }
                    return;
                }
            });
            if (checkInOut == 'None')
                return sendError(res, "Super delivery is not available to this district")
            code_area1 = shippingPriceList.SuperFee[0]._doc[fromCity].code_area;
            key = `${code_area1}-${code_area2}`;
            shippingPriceList.SuperFee[0]._doc[fromCity].level2s.forEach((level2) => {
                if (level2.level2_id.includes(key)) {
                    if (checkInOut == 'In')
                        shipCost = level2.costIn;
                    else
                        shipCost = level2.costOut;
                }
            });
        }
        const fee = await Fee.findOne({});
        const totalPrice = calculateShippingExpressCost(weight, shipCost, fee.fuel_fee, fee.VAT, shippingtype);

        return sendSuccess(res, "Successfully", {shippingcost: totalPrice} );

    } catch (error) {
        console.log(error);
        sendServerError(res, error);
    }

});

router.post('/insurance-fee', (req, res) => {
    try {
        const goods_value = req.body.goods_value;
        if (goods_value === '')
            return sendError(res, "Please enter goods value");
        const insurance_fee = Math.ceil(goods_value*0.1);

        return sendSuccess(res, "Successfully", {insurance_fee: insurance_fee} );

    } catch (error) {
        console.log(error);
        sendServerError(res, error);
    }

});

export default router;
