// lib/pro/csv.ts
// Celda CSV segura para Excel: entre comillas, comillas duplicadas, y prefijo
// ' en celdas que empiezan con = + - @ (o tab/CR) contra inyección de fórmulas.
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
