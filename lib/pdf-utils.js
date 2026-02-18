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
 * Box blur on a luminance map (two-pass: horizontal + vertical)
 * @param {Float32Array} lumMap
 * @param {number} width
 * @param {number} height
 * @param {number} radius
 * @returns {Float32Array}
 */
function boxBlurLuminance(lumMap, width, height, radius) {
    const temp   = new Float32Array(lumMap.length);
    const output = new Float32Array(lumMap.length);

    // Horizontal pass
    for (let y = 0; y < height; y++) {
        let sum = 0, count = 0;
        // Prime the window
        for (let x = 0; x < Math.min(radius, width); x++) {
            sum += lumMap[y * width + x];
            count++;
        }
        for (let x = 0; x < width; x++) {
            // Expand right edge
            const rightX = x + radius;
            if (rightX < width) { sum += lumMap[y * width + rightX]; count++; }
            // Remove left edge that fell out
            const leftX = x - radius - 1;
            if (leftX >= 0) { sum -= lumMap[y * width + leftX]; count--; }
            temp[y * width + x] = sum / count;
        }
    }

    // Vertical pass on temp
    for (let x = 0; x < width; x++) {
        let sum = 0, count = 0;
        // Prime the window
        for (let y = 0; y < Math.min(radius, height); y++) {
            sum += temp[y * width + x];
            count++;
        }
        for (let y = 0; y < height; y++) {
            const bottomY = y + radius;
            if (bottomY < height) { sum += temp[bottomY * width + x]; count++; }
            const topY = y - radius - 1;
            if (topY >= 0) { sum -= temp[topY * width + x]; count--; }
            output[y * width + x] = sum / count;
        }
    }

    return output;
}

/**
 * Smart invert for PDFs.
 * - Dark slides (presentations, dark-bg pages): fully inverts everything
 *   so dark bg → white, white text → black. Perfect for printing.
 * - Light documents (white bg, black text): uses box-blur local neighborhood
 *   to detect large dark regions (sidebars, headers, dark UI blocks) and
 *   inverts only those, leaving normal black-on-white text completely untouched.
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
        canvas.width  = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        await page.render({ canvasContext: ctx, viewport }).promise;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const W = canvas.width;
        const H = canvas.height;

        // ── PASS 1: Sample page to decide overall page type ──────────────────
        let darkPixels  = 0;
        let lightPixels = 0;
        const sampleStep = 16; // sample every 16th pixel (fast)
        for (let j = 0; j < data.length; j += 4 * sampleStep) {
            const lum = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2];
            if (lum < 80)       darkPixels++;
            else if (lum > 180) lightPixels++;
        }
        const totalSampled = darkPixels + lightPixels;
        const darkRatio = totalSampled > 0 ? darkPixels / totalSampled : 0;

        // ── PASS 2: Apply inversion ───────────────────────────────────────────
        if (darkRatio > 0.35) {
            // ── DARK SLIDE ──
            // Invert every pixel. Dark bg → white, white/colored text → dark.
            // Result is a clean light-background version, great for printing.
            for (let j = 0; j < data.length; j += 4) {
                data[j]     = 255 - data[j];
                data[j + 1] = 255 - data[j + 1];
                data[j + 2] = 255 - data[j + 2];
                // alpha unchanged
            }
        } else {
            // ── LIGHT DOCUMENT ──
            // Build luminance map, then blur it to find locally dark regions.
            // Only pixels inside large dark regions get inverted;
            // isolated dark pixels (= text strokes on white) are left alone.

            const lumMap = new Float32Array(W * H);
            for (let j = 0; j < data.length; j += 4) {
                lumMap[j >> 2] = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2];
            }

            // blur radius ~10px at RENDER_SCALE=2 → ~5pt in PDF space, enough to
            // span text strokes (1–2px) but not large dark blocks (many px wide)
            const blurred = boxBlurLuminance(lumMap, W, H, 10);

            for (let j = 0; j < data.length; j += 4) {
                const localAvgLum = blurred[j >> 2];
                if (localAvgLum < 100) {
                    // This pixel lives inside a large dark region → invert it
                    data[j]     = 255 - data[j];
                    data[j + 1] = 255 - data[j + 1];
                    data[j + 2] = 255 - data[j + 2];
                }
                // else: light neighborhood (white page + black text) → leave alone
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // ── Embed processed canvas into output PDF ────────────────────────────
        const pngDataUrl = canvas.toDataURL('image/png');
        const pngBase64  = pngDataUrl.split(',')[1];
        const pngBytes   = Uint8Array.from(atob(pngBase64), (c) => c.charCodeAt(0));

        const pngImage = await outputPdf.embedPng(pngBytes);

        const origViewport = page.getViewport({ scale: 1 });
        const newPage = outputPdf.addPage([origViewport.width, origViewport.height]);
        newPage.drawImage(pngImage, {
            x: 0,
            y: 0,
            width:  origViewport.width,
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
