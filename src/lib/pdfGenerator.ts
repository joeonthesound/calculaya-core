import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type ReciboPDFInput = {
  emisor: string;
  cliente: string;
  monto: number;
  concepto: string;
};

const PAGE_WIDTH = 550;
const PAGE_HEIGHT = 400;
const MARGIN = 34;

const formatMoney = (amount: number) =>
  new Intl.NumberFormat('es-PA', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

const wrapText = (text: string, maxChars: number) => {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length > maxChars && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

export const generateReciboPDF = async ({
  emisor,
  cliente,
  monto,
  concepto,
}: ReciboPDFInput): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    color: rgb(0.98, 0.98, 0.97),
  });

  page.drawText('Recibo', {
    x: MARGIN,
    y: 342,
    size: 28,
    font: titleFont,
    color: rgb(0.12, 0.12, 0.12),
  });

  page.drawText('Comprobante de pago', {
    x: MARGIN,
    y: 318,
    size: 11,
    font: bodyFont,
    color: rgb(0.38, 0.38, 0.38),
  });

  page.drawRectangle({
    x: MARGIN,
    y: 216,
    width: PAGE_WIDTH - MARGIN * 2,
    height: 76,
    color: rgb(0.9, 0.9, 0.88),
    borderColor: rgb(0.75, 0.75, 0.72),
    borderWidth: 1,
  });

  page.drawText('TOTAL', {
    x: MARGIN + 20,
    y: 262,
    size: 10,
    font: titleFont,
    color: rgb(0.35, 0.35, 0.34),
  });

  page.drawText(formatMoney(monto), {
    x: MARGIN + 20,
    y: 232,
    size: 26,
    font: titleFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  const details = [
    ['Emisor', emisor],
    ['Cliente', cliente],
  ];

  let detailY = 174;

  for (const [label, value] of details) {
    page.drawText(label.toUpperCase(), {
      x: MARGIN,
      y: detailY,
      size: 9,
      font: titleFont,
      color: rgb(0.45, 0.45, 0.44),
    });

    page.drawText(value, {
      x: MARGIN,
      y: detailY - 20,
      size: 13,
      font: bodyFont,
      color: rgb(0.12, 0.12, 0.12),
    });

    detailY -= 58;
  }

  page.drawText('CONCEPTO', {
    x: MARGIN + 240,
    y: 174,
    size: 9,
    font: titleFont,
    color: rgb(0.45, 0.45, 0.44),
  });

  const conceptLines = wrapText(concepto, 34).slice(0, 5);
  conceptLines.forEach((line, index) => {
    page.drawText(line, {
      x: MARGIN + 240,
      y: 154 - index * 17,
      size: 12,
      font: bodyFont,
      color: rgb(0.12, 0.12, 0.12),
    });
  });

  page.drawLine({
    start: { x: MARGIN, y: 56 },
    end: { x: PAGE_WIDTH - MARGIN, y: 56 },
    thickness: 1,
    color: rgb(0.82, 0.82, 0.8),
  });

  page.drawText('Creado gratis en CalculaYa.online', {
    x: MARGIN,
    y: 32,
    size: 9,
    font: bodyFont,
    color: rgb(0.48, 0.48, 0.46),
  });

  return pdfDoc.save();
};
