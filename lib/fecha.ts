/**
 * Formatea la fecha de emision de un certificado.
 *
 * `issue_date` es una fecha calendario (columna DATE), pero viaja como
 * "2026-06-19T00:00:00.000Z". Usar `new Date(...)` la interpreta como UTC y,
 * en zonas con offset negativo como Peru (UTC-5), la muestra un dia antes.
 * Por eso se toma la parte de la fecha tal cual, sin conversion horaria.
 */
export function formatFechaCertificado(iso: string | null | undefined): string {
  if (!iso) return '';
  const [anio, mes, dia] = iso.split('T')[0].split('-');
  if (!anio || !mes || !dia) return '';
  return `${Number(dia)}/${Number(mes)}/${anio}`;
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Version larga: "19 de junio de 2026". */
export function formatFechaLarga(iso: string | null | undefined): string {
  if (!iso) return '';
  const [anio, mes, dia] = iso.split('T')[0].split('-');
  if (!anio || !mes || !dia) return '';
  return `${Number(dia)} de ${MESES[Number(mes) - 1]} de ${anio}`;
}
