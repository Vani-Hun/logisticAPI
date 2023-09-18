export const OrderForm = {
    generateDoc : (order) => {
        // test
        // let orderId = '2323NSDNSDN';
        // let createdAt = '2023-07-24 15:24:00';
        // let senderName = 'Lê Thị B';
        // let senderPhone = '****343434';
        // let senderAddress = '100 Hồ Nội';
        // let reciverName = 'Nguyễn Văn A';
        // let reciverPhone = '****2323232';
        // let reciverAddress = '393 Hồ Chí Minh';
        // let cod = '250.000';
        // let weight = '2 kg';
        // let pay_method = "CC_CASH";
        // let pay_method_money = '10.700';
        // let order_discrible = 'Mỹ phẩm';
        // let number_product = '1';
        // let fee_insurance = '23.000';
        // let fee_other = '1.000';
        // let postOfficeCode = '244ABO9595';
        // let transportation = 'A';

        let orderId = 'NONE';
        if (order.orderId != null && order.orderId != undefined){
            orderId = order.orderId;
        }

        let createdAt = 'NONE';
        if (order.createdAt
             != null && order.createdAt != undefined){
            createdAt  = order.createdAt;
        }
   
        let senderName = 'NONE';
        let senderPhone = 'NONE';
        let senderAddress = 'NONE';
        if (order.sender != null && order.sender != undefined){
            if (order.sender.name != null && order.sender.name != undefined){
                senderName   = order.sender.name;
            }
            if (order.sender.phone != null && order.sender.phone != undefined){
                senderPhone   = "****" + order.sender.phone.substr(3,order.sender.phone.lenght);
            }
            if (order.sender.address != null && order.sender.address != undefined){
                senderAddress  = order.sender.address;
            }
        }
        
        let reciverName = 'NONE';
        let reciverPhone = 'NONE';
        let reciverAddress = 'NONE';
        if (order.receiver != null && order.receiver != undefined){
            if (order.receiver.name != null && order.receiver.name != undefined){
                reciverName  = order.receiver.name;
            }
            if (order.receiver.phone != null && order.receiver.phone != undefined){
                reciverPhone  = "****" + order.receiver.phone.substr(3,order.receiver.phone.lenght);
            }    
            if (order.receiver.address != null && order.receiver.address != undefined){
                reciverAddress = order.receiver.address;
            }
        }
        
        let cod = 'NONE';
        let pay_method_money = 'NONE';
        if (order.cod != null && order.cod != undefined){
            if (order.cod.cod != null && order.cod.cod != undefined){
                cod  = order.cod.cod;
            }
            if (order.cod.fee != null && order.cod.fee != undefined){
                pay_method_money = order.cod.fee;
            }
        }
       
        let weight = 'NONE';
        let order_discrible = 'NONE';
        let number_product = 'NONE';
        if (order.product != null && order.product != undefined){
            if (order.product.weight != null && order.product.weight != undefined){
                weight  = order.product.weight;
            }
            if (order.product.name != null && order.product.name != undefined){
                order_discrible = order.product.name;
            }
            if (order.product.quantity != null && order.product.quantity != undefined){
                number_product = order.product.quantity;
            }
        }
       
        let pay_method = 'NONE';
        if (order.product.cash_payment != null && order.product.cash_payment != undefined){
            pay_method  = order.product.cash_payment;
        }

        let fee_insurance = 'NONE';
   
        let fee_other = 'NONE';
      
        let postOfficeCode = 'NONE';
        if (order.origin != null && order.origin != undefined){
            if (order.origin.code != null && order.origin.code != undefined){
                postOfficeCode = order.origin.code;
            }
        }
    
        let transportation ='A';
        
        var signPart = {
            fontSize: 11,
            table: {
                widths: ['50%', '50%'],
                body: [
                    [{
                            text: 'Người gửi kí',
                            border: [true, false, true, false],
                        },
                        {
                            text: 'Người nhận kí',
                            border: [true, false, true, false],
                            //   fontSize: 20,
    
                        }
                    ],
                    [{
                            text: '.........................................',
                            border: [true, false, false, false],
                        },
                        {
                            text: '.........................................',
                            border: [true, false, true, false],
                        },
                    ],
                    [{
                            text: '',
                            border: [true, false, true, false],
                        },
                        {
                            text: '',
                            border: [false, false, true, false],
                        }
                    ],
                    [{
                            text: '',
                            border: [true, false, false, false],
                        },
                        {
                            text: '',
                            border: [true, false, true, false],
                        },
                    ],
                    [{
                            text: '',
                            border: [true, false, true, false],
                        },
                        {
                            text: '',
                            border: [false, false, true, false],
                            //   fontSize: 20,
                            alignment: 'center'
                        }
                    ],
                    [{
                            text: '',
                            border: [true, false, false, false],
                        },
                        {
                            text: '',
                            border: [true, false, true, false],
                        },
                    ],
                    [{
                            text: '',
                            border: [true, false, true, false],
                        },
                        {
                            text: '',
                            border: [false, false, true, false],
                        }
                    ],
                    [{
                            text: '',
                            border: [true, false, false, true],
                        },
                        {
                            text: '',
                            border: [true, false, true, true],
                        },
                    ],
    
                ]
            }
        };
        var sender_reciever = [{
                fontSize: 11,
                table: {
                    widths: ['100%'],
                    body: [
                        [{
                                text: 'Thông tin người gửi :',
                                border: [true, false, true, false],
                                bold: true
                            },
    
                        ],
                        [{
                            text: `${senderName}, ${senderPhone}, ${senderAddress}`,
                            border: [true, false, true, true],
                            bold: true
                        }, ]
                    ]
                }
            },
            {
                fontSize: 11,
                table: {
                    widths: ['100%'],
                    body: [
                        [{
                                text: 'Thông tin người nhận :',
                                border: [true, false, true, false],
                                bold: true
                            },
    
                        ],
                        [{
                            text: `${reciverName}, ${reciverPhone}, ${reciverAddress}`,
                            border: [true, false, true, true],
                            bold: true
                        }, ]
                    ]
                }
            },
        ];
    
        var doc = {
            pageMargins: [ 0, 0, 0,0 ],
            pageSize: {
                width: 300,
                height: 'auto'
            },
            content: [{
                    fontSize: 11,
                    table: {
                        widths: ['50%', '50%'],
                        body: [
                            [{
                                    text: '',
                                    border: [true, true, false, false],
                                },
                                {
                                    qr: orderId,
                                    fit: 80,
                                    alignment: 'right',
                                    margin: [0, 10, 0, 10],
                                    border: [false, true, true, false],
                                },
    
                            ],
                            [{
                                    text: createdAt,
                                    border: [true, false, false, false],
                                    bold: true
                                },
                                {
                                    text: orderId,
                                    alignment: 'right',
                                    border: [false, false, true, false],
                                },
                            ]
                        ]
                    }
                },
    
                {
                    fontSize: 11,
                    table: {
                        widths: ['80%', '20%'],
                        body: [
                            [{
                                    text: 'Thông tin người gửi :',
                                    border: [true, true, true, false],
                                    bold: true
                                },
                                {
                                    text: postOfficeCode,
                                    border: [true, true, true, false],
                                    //   fontSize: 20,
                                    alignment: 'center',
                                    bold: true
                                }
                            ],
                            [{
                                    text: `${senderName}, ${senderPhone}, ${senderAddress}`,
                                    border: [true, false, false, false],bold: true,
                                },
                                {
                                    text: '',
                                    border: [true, false, true, true],
                                },
                            ],
                            [{
                                    text: 'Thông tin người nhận :',bold: true,
                                    border: [true, true, true, false],
                                },
                                {
                                    text: transportation,
                                    border: [true, true, true, false],
                                    //   fontSize: 20,
                                    alignment: 'center',
                                    bold: true,
                                }
                            ],
                            [{
                                    text: `${reciverName}, ${reciverPhone}, ${reciverAddress}`,
                                    border: [true, false, false, true],
                                    bold: true
                                },
                                {
                                    text: '',
                                    border: [true, false, true, true],
                                },
                            ],
    
                        ]
                    }
                },
                {
                    fontSize: 11,
                    table: {
                        widths: ['50%', '50%'],
                        body: [
                            [{
                                    text: 'TL thực tế : '+ weight,
                                    border: [true, false, true, false],
                                },
                                {
                                    text: 'PTTT / Tổng cước phí',
                                    border: [true, false, true, false],
                                    //   fontSize: 20,
    
                                }
                            ],
                            [{
                                    text: '',
                                    border: [true, false, false, false],
                                },
                                {
                                    text: `${pay_method} ${pay_method_money}`,
                                    border: [true, false, true, false],
                                },
                            ],
                            [{
                                    text: 'Tiền thu hộ :',
                                    border: [true, true, true, false],
                                },
                                {
                                    text: '',
                                    border: [false, false, true, false],
                                    //   fontSize: 20,
                                    alignment: 'center'
                                }
                            ],
                            [{
                                    text: cod,
                                    border: [true, false, false, true],
                                },
                                {
                                    text: '',
                                    border: [true, false, true, true],
                                },
                            ],
    
                        ]
                    }
                },
                signPart,
                {
                    fontSize: 11,
                    table: {
                        widths: ['100%'],
                        body: [
                            [{
                                    text: 'Mã vận đơn : ' + orderId,
                                    bold: true,
                                    border: [true, false, true, true],
                                },
    
                            ],
                        ]
                    }
                },
                ...sender_reciever,
                {
                    fontSize: 11,
                    table: {
                        widths: ['50%', '50%'],
                        body: [
                            [{
                                    text: 'Tiền thu hộ :',
                                    border: [true, false, true, false],
                                },
    
                                {
                                    text: 'PTTT / Tổng cước phí :',
                                    border: [true, false, true, false],
                                },
    
                            ],
                            [{
                                    text: cod,
                                    border: [true, false, true, true],
                                },
                                {
                                    text: `${pay_method} ${pay_method_money}`,
                                    border: [true, false, true, true],
                                },
    
                            ]
                        ]
                    }
                },
                {
                    fontSize: 11,
                    table: {
                        widths: ['100%'],
                        body: [
                            [{
                                    qr: orderId,
                                    fit: 80,
                                    alignment: 'right',
                                    margin: [0, 10, 0, 10],
                                    border: [true, false, true, false],
                                },
    
                            ],
                            [{
                                text: orderId,
                                alignment: 'right',
                                border: [true, false, true, false],
                            }, ]
                        ]
                    }
                },
    
                {
                    fontSize: 11,
                    table: {
                        widths: ['100%'],
                        body: [
                            [{
                                    text: 'Thông tin người gửi :',
                                    border: [true, true, true, false],
                                    bold: true
                                },
    
                            ],
                            [{
                                text: `${senderName}, ${senderPhone}, ${senderAddress}`,
                                border: [true, false, true, true],
                                bold: true
                            }, ]
                        ]
                    }
                },
                {
                    fontSize: 11,
                    table: {
                        widths: ['100%'],
                        body: [
                            [{
                                    text: 'Thông tin người nhận :',
                                    border: [true, false, true, false],
                                    bold: true
                                },
    
                            ],
                            [{
                                text: `${reciverName}, ${reciverPhone}, ${reciverAddress}`,
                                border: [true, false, true, true],
                                bold: true
                            }, ]
                        ]
                    }
                },
                {
                    fontSize: 11,
                    table: {
                        widths: ['50%', '50%'],
                        body: [
                            [{
                                    text: 'Nội dung hàng hóa :' + order_discrible,
                                    border: [true, false, false, true],
                                },
    
                                {
                                    text: 'SL : ' + number_product,
                                    border: [false, false, true, false],
                                },
    
                            ],
                            [{
                                    text: 'SL Thực tê : ' + weight,
                                    border: [true, false, true, true],
                                },
                                {
                                    text: 'Phí ngoại thành xa',
                                    border: [true, true, true, true],
                                },
    
                            ],
                            [{
                                    text: 'Phí bảo hiểm : ' + fee_insurance,
                                    border: [true, false, true, true],
                                },
                                {
                                    text: 'Phí khác : ' + fee_other,
                                    border: [true, true, true, true],
                                },
                            ],
                            [{
                                    text: 'Tiền thu hộ',
                                    border: [true, false, true, false],
                                },
                                {
                                    text: 'PTTT / Tổng cước phí',
                                    border: [true, true, true, false],
                                },
                            ],
                            [{
                                    text: cod,
                                    border: [true, false, true, true],
                                },
                                {
                                    text: `${pay_method} ${pay_method_money}`,
                                    border: [true, false, true, true],
                                },
                            ],
                        ]
                    }
                },
            ]
        };
    
        return doc;
    },
}