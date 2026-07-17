import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

interface CertificateData {
  type: 'certificado' | 'constancia';
  fullName: string;
  courseName: string;
  hours: number;
  issueDate: string;
  verificationCode: string;
  instructor: string | null;
}

const GREEN = '#759C30';
const DARK = '#1a1a1a';
const GRAY = '#666666';
const LIGHT_GRAY = '#999999';

function loadAsset(filename: string): string | null {
  const p = path.resolve(__dirname, '../assets', filename);
  return fs.existsSync(p) ? p : null;
}

export function generateCertificatePDF(data: CertificateData): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const W = doc.page.width;  // 842
  const H = doc.page.height; // 595

  // --- Background & borders ---
  doc.rect(0, 0, W, H).fill('#ffffff');

  // Green accent bars top & bottom
  doc.rect(0, 0, W, 12).fill(GREEN);
  doc.rect(0, H - 12, W, 12).fill(GREEN);

  // Inner border
  doc.rect(24, 24, W - 48, H - 48).lineWidth(1.5).stroke(GREEN);
  doc.rect(30, 30, W - 60, H - 60).lineWidth(0.5).stroke('#d4d4d4');

  // Corner accents
  const cornerSize = 18;
  const corners = [
    { x: 30, y: 30 },
    { x: W - 30 - cornerSize, y: 30 },
    { x: 30, y: H - 30 - cornerSize },
    { x: W - 30 - cornerSize, y: H - 30 - cornerSize },
  ];
  for (const c of corners) {
    doc.rect(c.x, c.y, cornerSize, cornerSize).lineWidth(0.8).stroke(GREEN);
  }

  // --- Logo ---
  const logoPath = loadAsset('genesLogo.png');
  if (logoPath) {
    const logoSize = 72;
    doc.image(logoPath, (W - logoSize) / 2, 42, { width: logoSize, height: logoSize });
  }

  // --- Organization name ---
  const contentLeft = 60;
  const contentWidth = W - 120;

  doc.fontSize(10).font('Helvetica-Bold').fillColor(GREEN)
    .text('GENES PERU', contentLeft, 120, { align: 'center', width: contentWidth });

  doc.fontSize(7.5).font('Helvetica').fillColor(LIGHT_GRAY)
    .text('Gremio Nacional de Emprendedores Sostenibles', contentLeft, 134, { align: 'center', width: contentWidth });

  // Decorative divider
  const divY = 149;
  const divHalf = 120;
  doc.moveTo(W / 2 - divHalf, divY).lineTo(W / 2 - 4, divY).lineWidth(1).stroke(GREEN);
  doc.moveTo(W / 2 + 4, divY).lineTo(W / 2 + divHalf, divY).lineWidth(1).stroke(GREEN);
  doc.circle(W / 2, divY, 2.5).fill(GREEN);

  // --- Title ---
  const title = data.type === 'certificado' ? 'CERTIFICADO' : 'CONSTANCIA';
  doc.fontSize(32).font('Helvetica-Bold').fillColor(DARK)
    .text(title, contentLeft, 162, { align: 'center', width: contentWidth, characterSpacing: 4 });

  doc.fontSize(11).font('Helvetica').fillColor(GRAY)
    .text('DE PARTICIPACION', contentLeft, 200, { align: 'center', width: contentWidth, characterSpacing: 2 });

  // --- "Otorgado a" ---
  doc.fontSize(10).font('Helvetica').fillColor(GRAY)
    .text('Se otorga el presente a:', contentLeft, 228, { align: 'center', width: contentWidth });

  // --- Full name ---
  const nameText = data.fullName.toUpperCase();
  const nameFontSize = nameText.length > 35 ? 22 : nameText.length > 25 ? 26 : 30;

  doc.fontSize(nameFontSize).font('Helvetica-Bold').fillColor(GREEN)
    .text(nameText, contentLeft, 248, { align: 'center', width: contentWidth });

  // Line under name
  const nameLineY = 248 + nameFontSize + 10;
  const nameLineHalf = Math.min(200, nameText.length * 6);
  doc.moveTo(W / 2 - nameLineHalf, nameLineY).lineTo(W / 2 + nameLineHalf, nameLineY)
    .lineWidth(0.5).stroke('#cccccc');

  // --- Course info ---
  const courseStartY = nameLineY + 14;
  doc.fontSize(10).font('Helvetica').fillColor(GRAY)
    .text('Por haber participado satisfactoriamente en el curso:', contentLeft, courseStartY, { align: 'center', width: contentWidth });

  doc.fontSize(15).font('Helvetica-Bold').fillColor(DARK)
    .text(`“${data.courseName}”`, contentLeft, courseStartY + 18, { align: 'center', width: contentWidth });

  // --- Hours & Date ---
  const detailsY = courseStartY + 44;
  doc.fontSize(10).font('Helvetica').fillColor(GRAY)
    .text(`Con una duracion de ${data.hours} horas academicas`, contentLeft, detailsY, { align: 'center', width: contentWidth });

  const dateStr = new Date(data.issueDate).toLocaleDateString('es-PE', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  doc.text(`Lima, ${dateStr}`, contentLeft, detailsY + 14, { align: 'center', width: contentWidth });

  // --- Two signatures side by side ---
  const sigY = H - 150;
  const sigWidth = 200;
  const sigGap = 60;
  const leftSigX = W / 2 - sigWidth - sigGap / 2;
  const rightSigX = W / 2 + sigGap / 2;

  // Signature images
  const firmaIsabel = loadAsset('firma_isabel.jpeg');
  const firmaEduardo = loadAsset('firma_eduardo.jpeg');

  const sigImgWidth = 140;
  const sigImgHeight = 50;

  if (firmaIsabel) {
    doc.image(firmaIsabel, leftSigX + (sigWidth - sigImgWidth) / 2, sigY - sigImgHeight + 5, {
      width: sigImgWidth, height: sigImgHeight,
    });
  }

  if (firmaEduardo) {
    doc.image(firmaEduardo, rightSigX + (sigWidth - sigImgWidth) / 2, sigY - sigImgHeight + 5, {
      width: sigImgWidth, height: sigImgHeight,
    });
  }

  // Signature lines
  doc.moveTo(leftSigX + 10, sigY).lineTo(leftSigX + sigWidth - 10, sigY).lineWidth(0.5).stroke(DARK);
  doc.moveTo(rightSigX + 10, sigY).lineTo(rightSigX + sigWidth - 10, sigY).lineWidth(0.5).stroke(DARK);

  // Left: Mara Isabel Delgado
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(DARK)
    .text('Mara Isabel Delgado', leftSigX, sigY + 5, { align: 'center', width: sigWidth });
  doc.fontSize(7).font('Helvetica').fillColor(GRAY)
    .text('Directora Relaciones', leftSigX, sigY + 17, { align: 'center', width: sigWidth })
    .text('Interinstitucionales', leftSigX, sigY + 26, { align: 'center', width: sigWidth });

  // Right: Eduardo Jose Noriega Campos
  doc.fontSize(8.5).font('Helvetica-Bold').fillColor(DARK)
    .text('Eduardo Jose Noriega Campos', rightSigX, sigY + 5, { align: 'center', width: sigWidth });
  doc.fontSize(7).font('Helvetica').fillColor(GRAY)
    .text('Director Ejecutivo', rightSigX, sigY + 17, { align: 'center', width: sigWidth });

  // --- Verification footer ---
  const PUBLIC_URL = process.env.PUBLIC_URL || 'https://www.genesperu.earth';
  const footerY = H - 58;

  doc.fontSize(7).font('Helvetica').fillColor(LIGHT_GRAY)
    .text(`Codigo de verificacion: ${data.verificationCode}`, contentLeft, footerY, { align: 'center', width: contentWidth })
    .text(`Verifique este documento en: ${PUBLIC_URL}/intranet/verificar/${data.verificationCode}`, contentLeft, footerY + 11, { align: 'center', width: contentWidth });

  return doc;
}
