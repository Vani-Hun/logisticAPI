import ExcelJS from 'exceljs'
import Order from '../../model/Order.js';
import express from "express"
const exportExcelAdminRoute = express.Router()


/**
 * @route GET /api/admin/export
 * @description get order to export
 * @access private
 */
exportExcelAdminRoute.get('/', async (req, res) => {
    try {
        let infKey = ['Bill_of_lading', 'Confirm_staff', 'PickUp_staff', "Shipping_department", 'Note', 'Standard_fee', 'Delivery_company', 'Sender', 'Sender_phone', 'Total_amount_after_discount', 'Remote_area_surcharge', 'Total_amount_after_tax_and_discount', 'VAT', 'Total_amount_before_discount', 'Amount_payable', 'Discount_amount', 'Fuel_surcharge', 'Other_fees', 'Copyright_fee', 'Insurance_premium', 'COD', 'Chargeable_weight', 'Content_of_goods', 'Destination_area_code']
        let infValue = ["Mã vận đơn", "Tên nhân viên nhận hàng", "Tên nhân viên lấy hàng", "Bưu cục gửi hàng", "Ghi chú", "Cước tiêu chuẩn", "Công ty Gửi Hàng", "Tên người gửi", "Điện thoại người gửi", "Tổng cước sau chiết khấu", "Phụ phí vùng sâu vùng xa", "Tổng cước sau thuế và chiết khấu", "Thuế GTGT", "Tổng cước trước chiết khấu", "Tiền phải thu", "Số tiền chiết khấu", "Phụ phí xăng dầu", "Phí khác", "Phí bản quyền", "Phí bảo hiểm", "Tiền thu hộ", "Trọng lượng tính cước", "Nội dung hàng hóa", "Địa chỉ người nhận"]
        let wb = await new ExcelJS.Workbook()
        let ws = await wb.addWorksheet('Ready', { properties: { tabColor: { argb: 'FF00FF00' } } })
        ws.properties.defaultRowHeight = await 25;
        ws.properties.defaultColWidth = await 30;
        let col = []
        if (Object.keys(req.query).length !== 0) {
            let data = Object.keys(req.query)
            data.forEach(field => {
                let index = infKey.indexOf(field)
                col.push({ header: `${infValue[index]}`, key: `${field}` })
            })
        }
        ws.columns = col
        const order = await Order.find({})
            .populate([
                {
                    path: "confirm_staff",
                    select: "name",
                },
                {
                    path: "pickUp_staff",
                    select: "name",
                },
                // {
                //     path: "origin",
                //     select: "code",
                // },
                // {
                //     path: "destination",
                //     select: "code",
                // },
                {
                    path: "shipping",
                    select: "VAT",
                    populate: {
                        path: "VAT",
                        select: "cost"
                    }
                },
                {
                    path: "shipping",
                    select: "discount",
                    populate: {
                        path: "discount",
                        select: "discount"
                    }
                },]
            )
        await order.forEach((infor) => {
            infor.Bill_of_lading = infor.shipping.id,
                // infor.Shipping_department = infor.origin.address.code,
                infor.PickUp_staff = infor.pickUp_staff.name,
                infor.Confirm_staff = infor.confirm_staff.name,
                infor.Destination_area_code = infor.receiver.address,
                infor.Content_of_goods = infor.product.types,
                infor.Note = infor.product.payment_person,
                infor.Chargeable_weight = infor.product.weight,
                infor.Insurance_premium = infor.shipping.insurance_fees,
                infor.Standard_fee = infor.shipping.standard_fee,
                infor.Amount_payable = infor.shipping.amount_payable,
                infor.Fuel_surcharge = infor.shipping.fuel_surcharge,
                infor.Copyright_fee = infor.shipping.copyright_fee,
                infor.Discount_amount = infor.shipping.discount.discount,
                infor.Total_amount_before_discount = infor.shipping.total_amount_before_discount,
                infor.VAT = infor.shipping.VAT.cost,
                infor.Total_amount_after_tax_and_discount = infor.shipping.total_amount_after_tax_and_discount,
                infor.Total_amount_after_discount = infor.shipping.total_amount_after_discount,
                infor.Remote_area_surcharge = infor.shipping.remote_areas_surcharge,
                // infor.Delivery_company = infor.company.name,
                infor.Sent_date = infor.updatedAt,
                infor.Sender = infor.sender.name,
                infor.Sender_phone = infor.sender.phone,
                infor.Sender_address = infor.sender.address,
                infor.Receiver = infor.receiver.name,
                infor.Receiver_phone = infor.receiver.phone,
                infor.Receiver_address = infor.receiver.address,
                infor.Weight = infor.product.weight,
                infor.Product = infor.product.name,
                infor.COD = infor.cod.cod,
                infor.Status = infor.status,
                infor.Other_fees = infor.product.other,
                infor.Shipping_charges = infor.shipping.total_amount_after_tax_and_discount,
                ws.addRow(infor)
        });
        ws.pageSetup.horizontalCentered = 'true'
        ws.pageSetup.verticalCentered = 'true'
        await ws.getRow(1).eachCell((cell) => {
            cell.alignment = {
                vertical: 'middle',
                horizontal: 'center'
            },
                cell.font = {
                    bold: true
                },
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: 'D8F920' }
                }
        })
        for (let i = 2; i < order.length + 2; i++) {
            ws.getRow(i).eachCell((cell) => {
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: 'center'
                }
            })
        }
        await res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet")
        await res.setHeader("Content-Disposition", `attachment; filename=Orders.xlsx`)
        return wb.xlsx.write(res).then(() => {
            res.status(200)
        })
    } catch (error) {
        console.log(error)
    }
})
export default exportExcelAdminRoute