import { Resend } from 'resend';

const MAIL_FROM = process.env.MAIL_FROM || 'GENES Peru <no-reply@genesperu.earth>';
const PUBLIC_URL = process.env.PUBLIC_URL || 'https://www.genesperu.earth';

// El cliente se crea de forma perezosa para no romper el arranque si falta la key.
let client: Resend | null = null;
function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

export function mailerConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

const GREEN = '#5a7d23';

interface InvitationData {
  fullName: string;
  username: string;
  /** Contrasena en claro a comunicar (por defecto, igual al usuario). */
  password: string;
  email: string;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}

/**
 * Convierte todo caracter no-ASCII a su entidad numerica (&#NNN;).
 * El SDK de Resend re-codifica el UTF-8 y rompe las tildes/enies; con entidades
 * el cuerpo viaja como ASCII puro y se ve correcto en cualquier cliente.
 */
function toAsciiHtml(html: string): string {
  let out = '';
  for (const ch of html) {
    const cp = ch.codePointAt(0)!;
    out += cp > 127 ? `&#${cp};` : ch;
  }
  return out;
}

/** Quita tildes para el asunto y el cuerpo en texto plano (que no admiten entidades). */
function toAscii(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function invitationHtml(d: InvitationData): string {
  const nombre = escapeHtml(d.fullName);
  const usuario = escapeHtml(d.username);
  const clave = escapeHtml(d.password);
  const loginUrl = `${PUBLIC_URL}/intranet`;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f6f5ef;font-family:Arial,Helvetica,sans-serif;color:#20261a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5ef;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border:1px solid #e4e6db;border-radius:14px;overflow:hidden;">
        <tr><td style="background:${GREEN};height:6px;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:28px 32px 8px;">
          <p style="margin:0;font-size:13px;letter-spacing:1px;color:#8b937d;text-transform:uppercase;">GENES Perú · Intranet</p>
          <h1 style="margin:8px 0 0;font-size:22px;color:#20261a;">Tus certificados están listos</h1>
        </td></tr>
        <tr><td style="padding:8px 32px 0;font-size:15px;line-height:1.55;color:#3a4230;">
          <p style="margin:0 0 14px;">Hola <strong>${nombre}</strong>,</p>
          <p style="margin:0 0 14px;">Te damos acceso a la intranet de <strong>GENES Perú</strong>, donde puedes consultar y descargar tus certificados y constancias en PDF.</p>
        </td></tr>
        <tr><td style="padding:6px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#edf3e0;border:1px solid #dbe6c4;border-radius:10px;">
            <tr><td style="padding:16px 20px;font-size:15px;color:#20261a;">
              <p style="margin:0 0 6px;">Usuario: <strong style="font-family:Consolas,monospace;">${usuario}</strong></p>
              <p style="margin:0;">Contraseña: <strong style="font-family:Consolas,monospace;">${clave}</strong></p>
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:22px 32px 4px;">
          <a href="${loginUrl}" style="display:inline-block;background:${GREEN};color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:12px 28px;border-radius:8px;">Ingresar a la intranet</a>
        </td></tr>
        <tr><td style="padding:14px 32px 0;font-size:13px;line-height:1.5;color:#6a7359;">
          <p style="margin:0 0 10px;">Por tu seguridad, cambia la contraseña después de tu primer ingreso desde la sección <strong>Mi Cuenta</strong>.</p>
          <p style="margin:0;">Si el botón no funciona, copia y pega esta dirección: <br><span style="color:${GREEN};">${loginUrl}</span></p>
        </td></tr>
        <tr><td style="padding:22px 32px 28px;">
          <hr style="border:none;border-top:1px solid #e4e6db;margin:0 0 12px;">
          <p style="margin:0;font-size:12px;color:#9aa189;">GENES Perú · Gremio Nacional de Emprendedores Sostenibles. Este es un correo automático, por favor no respondas a esta dirección.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function invitationText(d: InvitationData): string {
  return [
    `Hola ${d.fullName},`,
    ``,
    `Te damos acceso a la intranet de GENES Perú para consultar y descargar tus certificados.`,
    ``,
    `Usuario: ${d.username}`,
    `Contraseña: ${d.password}`,
    ``,
    `Ingresa en: ${PUBLIC_URL}/intranet`,
    ``,
    `Por tu seguridad, cambia la contraseña luego de tu primer ingreso (sección "Mi Cuenta").`,
    ``,
    `GENES Perú · Gremio Nacional de Emprendedores Sostenibles.`,
  ].join('\n');
}

/** Envía la invitación con credenciales. Lanza si Resend responde con error. */
export async function sendInvitation(d: InvitationData): Promise<string> {
  const resend = getClient();
  if (!resend) throw new Error('RESEND_API_KEY no configurada');

  const { data, error } = await resend.emails.send({
    from: MAIL_FROM,
    to: d.email,
    subject: toAscii('Acceso a tus certificados - GENES Peru'),
    html: toAsciiHtml(invitationHtml(d)),
    text: toAscii(invitationText(d)),
  });

  if (error) throw new Error(error.message || 'Error de Resend');
  return data?.id || '';
}
