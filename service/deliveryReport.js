
export const handleDeliveryReportInfo = async (list) => {
  try {
    let report = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i][1] && JSON.stringify(list[i][0].other_costs) !== "{}") {
        let sum = list[i][0].cost + list[i][0].actual_fuel + list[i][0].other_costs + list[i][1].price
        report.push([list[i][0]._id, list[i][0].car, sum])
      } else if (list[i][1] && JSON.stringify(list[i][0].other_costs) === "{}"
      ) {
        let sum = list[i][0].cost + list[i][0].actual_fuel + list[i][1].price;
        report.push([list[i][0]._id, list[i][0].car, sum])
      } else {
        let sum = list[i][0].cost + list[i][0].actual_fuel
        report.push([list[i][0]._id, list[i][0].car, sum])
      }
    }
    return report
  } catch (error) {
    console.log(error)
  }
}

export const handleDeliveryReportInfoDetail = async (list) => {
  try {
    let report = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i][1] && JSON.stringify(list[i][0].other_costs) !== "{}") {
        let sum = list[i][0].cost + list[i][0].actual_fuel + list[i][0].other_costs + list[i][1].price
        report.push([`Bill is ${list[i][0]._id}, Car is ${list[i][0].car}, Total cost is ${sum}`])
      } else if (list[i][1] && JSON.stringify(list[i][0].other_costs) === "{}"
      ) {
        let sum = list[i][0].cost + list[i][0].actual_fuel + list[i][1].price;
        report.push([`Bill is ${list[i][0]._id}, Car is ${list[i][0].car}, Total cost is ${sum}`])
      } else {
        let sum = list[i][0].cost + list[i][0].actual_fuel
        report.push([`Bill is ${list[i][0]._id}, Car is ${list[i][0].car}, Total cost is ${sum}`])
      }
    }
    return report
  } catch (error) {
    console.log(error)
  }
};

