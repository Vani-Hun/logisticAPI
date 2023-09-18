import express from "express";
import { sendError, sendServerError, sendSuccess } from "../helper/client.js";
import Express from "../model/Express.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import pdfMake from 'pdfmake';
const expressRoute = express.Router()

/**
 * @route GET /api/express/provinces/:serviceType
 * @description users filter all provinces with that service type
 * @access private
 */
expressRoute.get('/provinces/:serviceType', async (req, res) => {
    const serviceType = req.params.serviceType;

    try {
        const shippingPriceList = await Express.findOne({ [serviceType]: { $exists: true } }); 
        if (!shippingPriceList) {
            return sendError(res,"Shipping price list not found", 404);
        }
        const serviceData = shippingPriceList[serviceType];
        if (!serviceData) {
            return sendError(res,`Service type ${serviceType} not found`, 404);
        }
        const provinces = Object.keys(serviceData[0]._doc).map(provinceName => {
        const provinceInfo = serviceData[0]._doc[provinceName];
        return {
            provinceName: provinceInfo.name,
        };
        }).filter(province => province.provinceName);
        return sendSuccess(res, "Successfully", provinces);
    } catch (error) {
        console.error(error);
        return sendServerError(res);
    }
});
/**
 * @route GET /api/express/provinces/:serviceType
 * @description user get all faqs with filter by keyword
 * @access private
 */
// expressRoute.get('/province/:serviceType/:provinceName', async (req, res) => {
//     const serviceType = req.params.serviceType;
//     const provinceName = req.params.provinceName;
//     try {
//         const shippingPriceList = await Express.findOne({ [serviceType]: { $exists: true } }); 
//         if (!shippingPriceList) {
//             return sendError(res,"Shipping price list not found", 404);
//         }
//         const serviceData = shippingPriceList[serviceType];
//         if (!serviceData) {
//             return sendError(res,`Service type ${serviceType} not found`, 404);
//         }
//         if (provinceName) {
//             const provinceInfo = serviceData[0]._doc[provinceName];
//             if (!provinceInfo) {
//                 return sendError(res,`Province ${provinceName} not found in ${serviceType}`, 404)
//             }
//             return sendSuccess(res, "Successfully", provinceInfo);
//         } else {
//             const provinces = Object.keys(serviceData[0]._doc).map(provinceName => {
//                 const provinceInfo = serviceData[0]._doc[provinceName];
//                 return { provinceName, provinceInfo };
//             });
//             return sendSuccess(res, "Successfully", provinces);
//         }
//     } catch (error) {
//         console.error(error);
//         return sendServerError(res);
//     }
// });
/**
 * @route GET /api/express/province/:serviceType/:provinceName
 * @description user get price list in pdf
 * @access private
 */
expressRoute.get('/province/:serviceType/:provinceName', async (req, res) => {
    const { serviceType, provinceName } = req.params;
    try {
        const shippingPriceList = await Express.findOne({ [serviceType]: { $exists: true } });
        if (!shippingPriceList) {
            return sendError(res, "Shipping price list not found", 404);
        }
        const serviceTypeMap = {
            FastFee: 'Cước dịch vụ vận chuyển nhanh',
            Standard: 'Cước dịch vụ vận chuyển tiêu chuẩn',
            SuperFee: 'Cước dịch vụ vận chuyển TKT super'
        };
        const serviceData = shippingPriceList[serviceType];
        if (!serviceData) {
            return sendError(res, `Service type ${serviceType} not found`, 404);
        }
        if (!serviceData[0]._doc[provinceName]) {
            return sendError(res, `Service not supported for province ${provinceName} or ${provinceName} not found `, 404);
        }
        const serviceName = serviceTypeMap[serviceType];
        const data = {
            level2s: serviceData[0]._doc[provinceName].level2s,
            cities: serviceData[0]._doc[provinceName].cities
        };
        const fonts = {
            Roboto: {
                normal: 'assets/fonts/Roboto-Regular.ttf',
                bold: 'assets/fonts/Roboto-Medium.ttf',
                italics: 'assets/fonts/Roboto-Italic.ttf',
                bolditalics: 'assets/fonts/Roboto-MediumItalic.ttf'
            }
        };
        const printer = new pdfMake(fonts);
        const docDefinition = {
            content: [
                { text: "BẢNG GIÁ DỊCH VỤ VẬN CHUYỂN TRONG NƯỚC", style: 'header' },
                { text: `(Áp dụng từ ${provinceName} đi các tỉnh thành)`, style: 'subheader' },
                { text: `${serviceName}`, style: 'subheader' },
                { text: '\n' },
                {
                    table: {
                        headerRows: 1,
                        headerFillColor: '#FF3333',
                        headerColor: '#FFFFFF',
                        widths: ['*', '*', '*'],
                        body: [
                            ['Mã vùng từ tỉnh/thành phố đi tỉnh/thành phố khác', 'Vùng phát gửi', 'Mức cước cho mức khối lượng theo kg: 0.50 - 1.00 - 1.50 - 2.00 - Mỗi 0.5kg tiếp theo'], 
                            ...data.level2s.map(level2 => [level2.level2_id, level2.range, level2.cost.join(' - ')])
                        ],
                    }
                },
                { text: '\n' },
                { text: `VÙNG TÍNH CƯỚC`, style: 'header' },
                { text: '\n' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*'],
                        body: [
                            ['Tỉnh/Thành phố', 'Mã vùng'], 
                            ...data.cities.map(city => [city.code_name, city.code_area])
                        ]
                    }
                },
                { text: '\n' },
                { text: '\n' },
                { text: '*Lưu ý:', style: 'sub' },
                { text: '\n' },
                { text: '- Giá trên tính bằng vnđ/kg. Số kg lẻ làm tròn lên. Giá trên chưa bao gồm 15% phụ phí nhiên liệu & VAT. Tính thêm 20% phụ phí với đơn hàng từ 10kg'},
                { text: '\n' },
                { text: '- Công thức tính hàng cồng kềnh (cm): (Dài x Rộng x Cao)/ 6000 = số kg tương ứng. Chiều dài một bên tối đa 1.4m, chiều dài ba bên cộng lại tối đa 2.4m. Nếu chiều dài một bên quá 1.4m hoặc chiều dài ba bên cộng lại quá 2.4m hoặc trọng lượng quy đổi quá 10kg, thì sẽ tính phụ phí 20%'},
                { text: '\n' },
                { text: '- Nếu vùng phát bưu gửi thuộc danh mục vùng sâu vùng xa sẽ cộng thêm 15% trên tổng số tiền gửi'},
                { text: '\n' },
                { text: '- Phụ phí hàng điện tử và một số mặt hàng đặc biệt khác (máy quay phim, máy chụp hình, máy tính xách tay, máy tính bảng, thiết bị tin học hỗ trợ cá nhân (PDAs), điện thoại di động, đồng hồ, bật lửa): 150.000đ/cái (chưa bao gồm VAT)'},
                { text: '\n' },   
            ],
            styles: {
                header: {
                    fontSize: 20,
                    bold: true,
                    weight:'bold',
                    color: 'red',
                    alignment: 'center'
                },
                subheader: {
                    fontSize: 16,
                    bold: true,
                    alignment: 'center'
                },
                sub: {
                    fontSize: 14,
                    bold: true,
                    italics: true
                   // alignment: 'center'
                }
            }
        };
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(res);
        pdfDoc.end();
    } catch (error) {
        console.error(error);
        return sendServerError(res);
    }
});

export default expressRoute;