export function calculateShippingExpressCost(weight, shipCost,FUEL_FEE,VAT, shippingtype) {
    try {
        let totalPrice = 0;
        if (weight <= 0.5) {
            totalPrice = Math.ceil(shipCost[0] + (FUEL_FEE * 0.15));
        } else if (weight <= 1) {
            totalPrice = Math.ceil(shipCost[1] + (FUEL_FEE * 0.15));
        } else if (weight <= 1.5) {
            totalPrice = Math.ceil(shipCost[2] + (FUEL_FEE * 0.15));
        } else if (weight <= 2) {
            totalPrice = Math.ceil(shipCost[3] + (FUEL_FEE * 0.15));
        } else {
            const baseWeight = 2;
            const numberOfIncreases = Math.ceil((weight - baseWeight) / 0.5);
            totalPrice = Math.ceil(shipCost[3] + (FUEL_FEE * 0.15) + (numberOfIncreases * shipCost[4]) );
            if(weight >=10 && shippingtype != 'super'){
                totalPrice = totalPrice + Math.ceil(totalPrice * 0.2);
            }
        }
        totalPrice = totalPrice + Math.ceil( (totalPrice * VAT) / 100 );
        return totalPrice;
    } catch (error) {
        console.log(error);
        sendServerError(res, error);
    }
}

export function calculateShippingOrderCost(weight, shipCost, FUEL_FEE, VAT, type_shipping, discount, insurance_fee) {
    try {
        let before_discount = 0
        let standard_fee = 0
        let after_discount = 0
        let after_discount_tax = 0
        let VAT_fee = 0
        if (weight <= 0.5) {
            standard_fee = shipCost[0]
        } else if (weight <= 1) {
            standard_fee = shipCost[1]
        } else if (weight <= 1.5) {
            standard_fee = shipCost[2]
        } else if (weight <= 2) {
            standard_fee = shipCost[3]
        } else {
            const baseWeight = 2
            const numberOfIncreases = Math.ceil((weight - baseWeight) / 0.5)
            standard_fee = standard_fee[3] + (numberOfIncreases * standard_fee[4])
        }
        before_discount = Math.ceil(standard_fee + (FUEL_FEE * 0.15));
        if(weight >=10 && type_shipping !== 'SUPER'){
            before_discount = before_discount + Math.ceil(before_discount * 0.2);
        }
        before_discount = before_discount + Math.ceil( (before_discount * VAT) / 100 ) + insurance_fee
        after_discount = before_discount - discount
        VAT_fee = after_discount * VAT / 100
        after_discount_tax = Math.ceil(after_discount + VAT_fee)
        return {
            standard_fee: standard_fee,
            before_discount: before_discount,
            discount: discount,
            after_discount: after_discount,
            VAT_fee: VAT_fee,
            after_discount_tax: after_discount_tax
        };
    } catch (error) {
        console.log(error);
        sendServerError(res, error);
    }
}