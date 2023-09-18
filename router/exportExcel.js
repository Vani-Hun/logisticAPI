import ExcelJS from 'exceljs'
import Order from '../model/Order.js';
import express from "express"
const exportExcelRoute = express.Router()

exportExcelRoute.get('/', async (req, res) => {
    try {
        let wb = await new ExcelJS.Workbook()
        let ws = await wb.addWorksheet('Myorders', { properties: { tabColor: { argb: 'FF00FF00' } } })
        ws.properties.defaultRowHeight = await 25;
        ws.properties.defaultColWidth = await 25;


        ws.columns = [
            { header: "Mã đơn đặt", key: "orderId" },
            { header: "Mã vận dơn", key: "Bill_of_lading" },
            { header: "Ngày gửi", key: "Sent_date" },
            { header: "Tên người gửi", key: "Sender" },
            { header: "Điện thoại người gửi", key: "Sender_phone" },
            { header: "Địa chỉ người gửi", key: "Sender_address" },
            { header: "Họ tên người nhận", key: "Receiver" },
            { header: "Điện thoại người nhận", key: "Receiver_phone" },
            { header: "Địa chỉ người nhận", key: "Receiver_address" },
            { header: "Trọng lượng", key: "Weight" },
            { header: "Tên hàng hóa", key: "Product" },
            { header: "Tiền thu hộ", key: "COD" },
            { header: "Trạng thái", key: "Status" },
            { header: "Phí khác", key: "Other_fees" },
            { header: "Vận phí", key: "Shipping_charges" },
        ]

        const order = await Order.find({ orderId: req.query.orderId })

        await order.forEach((infor) => {
            infor.Bill_of_lading = infor.shipping.id,
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
                infor.Shipping_charges = infor.shipping.total_fee,
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
        let start = { row: 1, col: 1 }
        let end = { row: order.length + 1, col: 15 }
        let borderWidth = 'medium'
        const borderStyle = {
            style: borderWidth
        };

        // Left Middle and Right

        for (let i = start.row; i <= end.row; i++) {
            let middlestart = 1
            const leftBorderCell = ws.getCell(i, start.col);
            const rightBorderCell = ws.getCell(i, end.col);

            leftBorderCell.border = {
                ...leftBorderCell.border,
                left: borderStyle
            };
            for (let j = 1; j < end.col; j++) {
                const middleBorderCell = ws.getCell(i, middlestart);
                middleBorderCell.border = {
                    ...middleBorderCell.border,
                    right: borderStyle
                }
                middlestart++
            }
            rightBorderCell.border = {
                ...rightBorderCell.border,
                right: borderStyle
            };
        }

        // Top Middle and Bottom

        for (let i = start.col; i <= end.col; i++) {
            let middlestart = start.row + 1
            const topBorderCell = ws.getCell(start.row, i);
            const bottomBorderCell = ws.getCell(end.row, i);

            topBorderCell.border = {
                ...topBorderCell.border,
                top: borderStyle
            };
            for (let j = 1; j < end.row; j++) {
                const middleBorderCell = ws.getCell(middlestart, i);
                middleBorderCell.border = {
                    ...middleBorderCell.border,
                    top: borderStyle
                }
                middlestart++
            }
            bottomBorderCell.border = {
                ...bottomBorderCell.border,
                bottom: borderStyle
            };
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
export default exportExcelRoute