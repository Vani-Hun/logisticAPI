
export const handleTotalCostInfo = async (listDeliveryReport, listInsurance, listWarehouse, listTax) => {
    try {
        let sum1 = 0, sum2 = 0, sum3 = 0, sum4 = 0
        let report = [], data1 = [], data2 = [], data3 = [], data4 = []
        for (let i = 0; i < listDeliveryReport.length; i++) {
            sum1 += await +listDeliveryReport[i][2]
            let data = await listDeliveryReport[i][2]
            let dataN = await listDeliveryReport[i][0]
            await data1.push(`Delivery cost is ${data}, bill is ${dataN}`)
        }
        for (let i = 0; i < listInsurance.length; i++) {
            sum2 += +listInsurance[i].cost
            let data = await listInsurance[i].cost
            let dataN = await listInsurance[i].name
            let dataM = await listInsurance[i].type_of_insurance
            await data2.push(`Name insurance is ${dataN}, type of insurance is ${dataM}, cost is ${data}`)
        }
        for (let i = 0; i < listWarehouse.length; i++) {
            sum3 += +listWarehouse[i].total_operating_costs
            let data = await listWarehouse[i].operating_costs
            let dataN = await listWarehouse[i].name
            let dataM = await listWarehouse[i].province
            await data3.push(`Name warehouse is ${dataN}, province is ${dataM}, cost is`, data)
        }
        for (let i = 0; i < listTax.length; i++) {
            sum4 += +listTax[i].cost
            let data = await listTax[i].cost
            let dataN = await listTax[i].name
            await data4.push(`Name tax is ${dataN}, cost is ${data}`)
        }
        report.push([data1, `Total cost is ${sum1}`],
            [data2, `Total cost is ${sum2}`],
            [data3, `Total cost is ${sum3}`],
            [data4, `Total cost is ${sum4}`])
        return report
    } catch (error) {
        console.log(error)
    }
}
