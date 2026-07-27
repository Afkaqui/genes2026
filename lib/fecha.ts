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

/** Zona de referencia: los servidores guardan en UTC, la operacion es en Peru. */
const ZONA_PERU = 'America/Lima';

/**
 * Formatea un instante (columna TIMESTAMP, ej. first_login_at) como
 * "26/07/2026, 19:36" en hora de Peru.
 *
 * A diferencia de `issue_date`, aqui SI corresponde convertir la zona: el valor
 * es un momento exacto guardado en UTC, no una fecha de calendario.
 */
export function formatFechaHora(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('es-PE', {
    timeZone: ZONA_PERU,
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

/** Solo la hora en zona de Peru: "19:36". */
export function formatHora(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('es-PE', {
    timeZone: ZONA_PERU, hour: '2-digit', minute: '2-digit', hour12: false,
  });
}
