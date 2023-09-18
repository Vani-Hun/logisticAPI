import PdfPrinter from 'pdfmake';
import {OrderForm} from './doc/order_form.js';
import {fonts} from './fonts.js';

export const PdfHelper = {
    createOrderForm : async (order) => {
        const printer = new PdfPrinter(fonts);
        const pdfDoc = printer.createPdfKitDocument(OrderForm.generateDoc(order),{});

        return new Promise((resolve, reject) => {
          try {
            const chunks = [];
            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.end();
          } catch (err) {
            reject(err);
          }
        });
      },
    
    errorPdfHtmlTemplate : (error) => `
        <h2>There was an error displaying the PDF document.</h2>
        Error message: ${error}`,
} 