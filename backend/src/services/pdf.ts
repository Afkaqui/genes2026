import PDFDocument from 'pdfkit';

interface CertificateData {
  type: 'certificado' | 'constancia';
  fullName: string;
  courseName: string;
  hours: number;
  issueDate: string;
  verificationCode: string;
  instructor: string | null;
}

export function generateCertificatePDF(data: CertificateData): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
  });

  const W = doc.page.width;
  const H = doc.page.height;
  const GREEN = '#759C30';

  // Outer border
  doc.rect(20, 20, W - 40, H - 40).lineWidth(2.5).stroke(GREEN);
  doc.rect(28, 28, W - 56, H - 56).lineWidth(0.5).stroke(GREEN);

  // Corner decorations
  const corners = [
    [35, 35], [W - 55, 35], [35, H - 55], [W - 55, H - 55],
  ];
  for (const [cx, cy] of corners) {
    doc.rect(cx, cy, 20, 20).lineWidth(0.8).stroke(GREEN);
  }

  // Header
  doc.fontSize(18).font('Helvetica-Bold').fillColor(GREEN)
    .text('GENES PERU', 0, 55, { align: 'center' });

  doc.fontSize(9).font('Helvetica').fillColor('#888')
    .text('Gremio Nacional de Emprendedores Sostenibles', 0, 78, { align: 'center' });

  // Decorative line
  const lineY = 95;
  doc.moveTo(W / 2 - 180, lineY).lineTo(W / 2 + 180, lineY).lineWidth(1.5).stroke(GREEN);
  doc.circle(W / 2, lineY, 3).fill(GREEN);

  // Title
  const title = data.type === 'certificado' ? 'CERTIFICADO' : 'CONSTANCIA';
  doc.fontSize(36).font('Helvetica-Bold').fillColor('#1a1a1a')
    .text(title, 0, 110, { align: 'center' });

  doc.fontSize(13).font('Helvetica').fillColor('#666')
    .text('DE PARTICIPACION', 0, 152, { align: 'center' });

  // "Otorgado a"
  doc.fontSize(11).fillColor('#555')
    .text('Se otorga el presente a:', 0, 185, { align: 'center' });

  // Full name
  doc.fontSize(28).font('Helvetica-Bold').fillColor(GREEN)
    .text(data.fullName.toUpperCase(), 0, 210, { align: 'center' });

  // Line under name
  const nameLineY = 248;
  doc.moveTo(W / 2 - 200, nameLineY).lineTo(W / 2 + 200, nameLineY)
    .lineWidth(0.5).stroke('#ccc');

  // Course info
  doc.fontSize(11).font('Helvetica').fillColor('#555')
    .text('Por haber participado satisfactoriamente en el curso:', 0, 265, { align: 'center' });

  doc.fontSize(16).font('Helvetica-Bold').fillColor('#1a1a1a')
    .text(`“${data.courseName}”`, 60, 290, { align: 'center', width: W - 120 });

  // Hours
  doc.fontSize(11).font('Helvetica').fillColor('#666')
    .text(`Con una duracion de ${data.hours} horas academicas`, 0, 325, { align: 'center' });

  // Date
  const dateStr = new Date(data.issueDate).toLocaleDateString('es-PE', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  doc.text(`Lima, ${dateStr}`, 0, 345, { align: 'center' });

  // Signature area
  const sigY = 400;
  doc.moveTo(W / 2 - 100, sigY).lineTo(W / 2 + 100, sigY).lineWidth(0.5).stroke('#333');

  if (data.instructor) {
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#333')
      .text(data.instructor, 0, sigY + 5, { align: 'center' });
    doc.fontSize(8).font('Helvetica').fillColor('#666')
      .text('Instructor', 0, sigY + 18, { align: 'center' });
  }

  doc.fontSize(8).font('Helvetica').fillColor('#666')
    .text('GENES Peru', 0, sigY + 32, { align: 'center' });

  // Verification footer
  const PUBLIC_URL = process.env.PUBLIC_URL || 'https://www.genesperu.earth';

  doc.fontSize(7.5).fillColor('#aaa')
    .text(`Codigo de verificacion: ${data.verificationCode}`, 0, H - 62, { align: 'center' })
    .text(`Verifique este documento en: ${PUBLIC_URL}/intranet/verificar/${data.verificationCode}`, 0, H - 50, { align: 'center' });

  return doc;
}
