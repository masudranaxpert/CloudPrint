/**
 * Price Calculator for CloudPrint
 *
 * Pricing logic:
 * - 1 "pata" (sheet) = 2 pages (front + back)
 * - B&W price per sheet: configurable (default 1.3 BDT)
 * - Color price per sheet: configurable (default 2.6 BDT)
 * - Slides per page: 1, 2, 4, 8, or 16 slides fit on 1 page
 *   - e.g. 4 slides/page => 8 slides per sheet (since 1 sheet = 2 pages)
 */

/**
 * Calculate effective number of sheets needed
 * @param {number} totalPages - Total pages in the PDF
 * @param {number} slidesPerPage - How many slides to fit per page (1, 2, or 4)
 * @returns {number} Number of physical sheets needed
 */
export function calculateSheets(totalPages, slidesPerPage = 1) {
    // Each "page" of the PDF is one slide
    // slidesPerPage tells us how many PDF pages fit on one physical page
    // 1 sheet = 2 physical pages (front + back)
    const physicalPages = Math.ceil(totalPages / slidesPerPage);
    const sheets = Math.ceil(physicalPages / 2);
    return sheets;
}

/**
 * Calculate price for a single PDF
 * @param {Object} params
 * @param {number} params.pageCount - Total pages in the PDF
 * @param {string} params.printType - 'bw' or 'color'
 * @param {number} params.slidesPerPage - 1, 2, or 4
 * @param {number} params.copies - Number of copies
 * @param {Object} params.pricing - { blackWhitePerPage, colorPerPage }
 * @returns {Object} { sheets, pricePerCopy, totalPrice }
 */
export function calculatePdfPrice({ pageCount, printType = 'bw', slidesPerPage = 1, copies = 1, pricing }) {
    const sheets = calculateSheets(pageCount, slidesPerPage);
    const pricePerSheet = printType === 'color' ? pricing.colorPerPage : pricing.blackWhitePerPage;
    const pricePerCopy = sheets * pricePerSheet;
    const totalPrice = pricePerCopy * copies;

    return {
        sheets,
        pricePerSheet,
        pricePerCopy: Math.round(pricePerCopy * 100) / 100,
        totalPrice: Math.round(totalPrice * 100) / 100,
    };
}

/**
 * Calculate total price for multiple PDFs
 * @param {Array} pdfs - Array of PDF objects with pageCount, printType, slidesPerPage, copies
 * @param {Object} pricing - { blackWhitePerPage, colorPerPage }
 * @returns {Object} { items: [...], grandTotal }
 */
export function calculateTotalPrice(pdfs, pricing) {
    let grandTotal = 0;
    const items = pdfs.map((pdf) => {
        const result = calculatePdfPrice({ ...pdf, pricing });
        grandTotal += result.totalPrice;
        return {
            ...pdf,
            ...result,
        };
    });

    return {
        items,
        grandTotal: Math.round(grandTotal * 100) / 100,
    };
}

/**
 * Format price in BDT
 * @param {number} amount
 * @returns {string}
 */
export function formatPrice(amount) {
    return `৳${amount.toFixed(2)}`;
}

/**
 * Generate WhatsApp order message
 * @param {Object} orderData
 * @returns {string} WhatsApp URL
 */
export function generateWhatsAppUrl(phone, orderData) {
    const { items, grandTotal, customerName } = orderData;

    let message = `🖨️ *CloudPrint Order*\n`;
    message += `👤 Name: ${customerName}\n\n`;

    items.forEach((item, i) => {
        message += `📄 ${i + 1}. ${item.fileName}\n`;
        message += `   Pages: ${item.pageCount} | Sheets: ${item.sheets}\n`;
        message += `   Type: ${item.printType === 'bw' ? 'Black & White' : 'Color'}\n`;
        message += `   Slides/Page: ${item.slidesPerPage}\n`;
        message += `   Price: ৳${item.totalPrice}\n\n`;
    });

    message += `💰 *Total: ৳${grandTotal}*`;

    const encoded = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encoded}`;
}

/**
 * Generate Telegram order message
 * @param {string} username
 * @param {Object} orderData
 * @returns {string} Telegram URL
 */
export function generateTelegramUrl(username, orderData) {
    return `https://t.me/${username}`;
}
