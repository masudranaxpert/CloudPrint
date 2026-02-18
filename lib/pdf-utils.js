/**
 * PDF utility functions - client-side only
 * Uses pdf.js for page counting and pdf-lib for manipulation
 */

/**
 * Get page count from a PDF file (client-side)
 * @param {File} file - The PDF file object
 * @returns {Promise<number>} Number of pages
 */
export async function getPdfPageCount(file) {
    const pdfjsLib = await import('pdfjs-dist');

    // Use local worker file copied to public/ directory
    // pdfjs-dist v5 requires a valid workerSrc path
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    pdf.destroy();

    return pageCount;
}

/**
 * Merge multiple PDF files into one
 * @param {File[]} files - Array of PDF files
 * @returns {Promise<Blob>} Merged PDF as Blob
 */
export async function mergePdfs(files) {
    const { PDFDocument } = await import('pdf-lib');
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    return new Blob([mergedBytes], { type: 'application/pdf' });
}

/**
 * Split a PDF into individual page PDFs
 * @param {File} file - The PDF file
 * @param {number[]} ranges - Array of page ranges, e.g., [[1,3], [4,6]]
 * @returns {Promise<Blob[]>} Array of PDF Blobs
 */
export async function splitPdf(file, ranges) {
    const { PDFDocument } = await import('pdf-lib');
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer);
    const results = [];

    for (const [start, end] of ranges) {
        const newPdf = await PDFDocument.create();
        const pageIndices = [];
        for (let i = start - 1; i < end && i < sourcePdf.getPageCount(); i++) {
            pageIndices.push(i);
        }
        const pages = await newPdf.copyPages(sourcePdf, pageIndices);
        pages.forEach((page) => newPdf.addPage(page));
        const bytes = await newPdf.save();
        results.push(new Blob([bytes], { type: 'application/pdf' }));
    }

    return results;
}

/**
 * Invert PDF colors using real pixel-level inversion.
 * Renders each page to canvas via pdf.js, inverts pixel data,
 * then embeds inverted images into a new PDF via pdf-lib.
 *
 * @param {File} file - The PDF file
 * @param {function} [onProgress] - Progress callback (pageNumber, totalPages)
 * @returns {Promise<Blob>} Inverted PDF as Blob
 */
export async function invertPdfBackground(file, onProgress) {
    const pdfjsLib = await import('pdfjs-dist');
    const { PDFDocument } = await import('pdf-lib');

    // Set worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const totalPages = sourcePdf.numPages;

    // Create the output PDF
    const outputPdf = await PDFDocument.create();

    // Render scale: 2x for good quality print output
    const RENDER_SCALE = 2;

    for (let i = 1; i <= totalPages; i++) {
        if (onProgress) onProgress(i, totalPages);

        const page = await sourcePdf.getPage(i);
        const viewport = page.getViewport({ scale: RENDER_SCALE });

        // Create offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        // Render the PDF page to canvas
        await page.render({
            canvasContext: ctx,
            viewport: viewport,
        }).promise;

        // Invert pixel data (simple full invert)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let j = 0; j < data.length; j += 4) {
            data[j] = 255 - data[j];       // Red
            data[j + 1] = 255 - data[j + 1]; // Green
            data[j + 2] = 255 - data[j + 2]; // Blue
            // Alpha (data[j + 3]) stays unchanged
        }
        ctx.putImageData(imageData, 0, 0);

        // Convert canvas to PNG bytes
        const pngDataUrl = canvas.toDataURL('image/png');
        const pngBase64 = pngDataUrl.split(',')[1];
        const pngBytes = Uint8Array.from(atob(pngBase64), (c) => c.charCodeAt(0));

        // Embed into new PDF
        const pngImage = await outputPdf.embedPng(pngBytes);

        // Use original page dimensions (in points, not pixels)
        const origViewport = page.getViewport({ scale: 1 });
        const newPage = outputPdf.addPage([origViewport.width, origViewport.height]);
        newPage.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: origViewport.width,
            height: origViewport.height,
        });
    }

    sourcePdf.destroy();

    const outputBytes = await outputPdf.save();
    return new Blob([outputBytes], { type: 'application/pdf' });
}

/**
 * Special "smart" invert for dark-slide PDFs.
 * Attempts to invert dark backgrounds and UI while keeping very bright areas
 * (near-white content, images) mostly unchanged.
 *
 * @param {File} file - The PDF file
 * @param {function} [onProgress] - Progress callback (pageNumber, totalPages)
 * @returns {Promise<Blob>} Inverted PDF as Blob
 */
export async function smartInvertPdfBackground(file, onProgress) {
    const pdfjsLib = await import('pdfjs-dist');
    const { PDFDocument } = await import('pdf-lib');

    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    const totalPages = sourcePdf.numPages;
    const outputPdf = await PDFDocument.create();
    const RENDER_SCALE = 2;

    for (let i = 1; i <= totalPages; i++) {
        if (onProgress) onProgress(i, totalPages);

        const page = await sourcePdf.getPage(i);
        const viewport = page.getViewport({ scale: RENDER_SCALE });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        await page.render({ canvasContext: ctx, viewport }).promise;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // --- IMPROVED: Per-pixel smart invert using luminance ---
        // Instead of all-or-nothing, we invert each pixel based on its own darkness.
        // Very bright pixels (near-white images, charts) are left mostly alone.
        // Dark pixels (dark backgrounds, dark UI) get inverted.
        // Mid-tone pixels get a smooth blend.

        for (let j = 0; j < data.length; j += 4) {
            const r = data[j];
            const g = data[j + 1];
            const b = data[j + 2];

            // Perceived luminance (0–255)
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;

            // Inversion strength: dark pixels → fully invert, bright pixels → don't touch
            // Threshold range: below 100 → invert fully, above 200 → leave alone, blend in between
            let strength;
            if (lum < 100) {
                strength = 1.0;
            } else if (lum > 200) {
                strength = 0.0;
            } else {
                // Smooth gradient between 100–200
                strength = 1.0 - (lum - 100) / 100;
            }

            if (strength > 0) {
                data[j]     = Math.round(r + strength * (255 - 2 * r));
                data[j + 1] = Math.round(g + strength * (255 - 2 * g));
                data[j + 2] = Math.round(b + strength * (255 - 2 * b));
            }
        }

        ctx.putImageData(imageData, 0, 0);

        const pngDataUrl = canvas.toDataURL('image/png');
        const pngBase64 = pngDataUrl.split(',')[1];
        const pngBytes = Uint8Array.from(atob(pngBase64), (c) => c.charCodeAt(0));

        const pngImage = await outputPdf.embedPng(pngBytes);
        const origViewport = page.getViewport({ scale: 1 });
        const newPage = outputPdf.addPage([origViewport.width, origViewport.height]);
        newPage.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: origViewport.width,
            height: origViewport.height,
        });
    }

    sourcePdf.destroy();
    const outputBytes = await outputPdf.save();
    return new Blob([outputBytes], { type: 'application/pdf' });
}

/**
 * Compress a PDF by removing unnecessary data
 * @param {File} file - The PDF file
 * @returns {Promise<{blob: Blob, originalSize: number, compressedSize: number}>}
 */
export async function compressPdf(file) {
    const { PDFDocument } = await import('pdf-lib');
    const arrayBuffer = await file.arrayBuffer();
    const originalSize = arrayBuffer.byteLength;

    const pdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
    });

    // Remove metadata to reduce size
    pdf.setTitle('');
    pdf.setAuthor('');
    pdf.setSubject('');
    pdf.setKeywords([]);
    pdf.setProducer('CloudPrint');
    pdf.setCreator('CloudPrint');

    const compressedBytes = await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
    });

    const compressedSize = compressedBytes.byteLength;

    return {
        blob: new Blob([compressedBytes], { type: 'application/pdf' }),
        originalSize,
        compressedSize,
    };
}

/**
 * Download a blob as a file
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
