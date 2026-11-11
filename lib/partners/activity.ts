// lib/partners/activity.ts
// Valores permitidos por el check partner_requests.activity_type en la base.
export const ACTIVITY_TYPES = ['salao', 'estetica', 'spa', 'clinica', 'ginasio', 'solario', 'outro'] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export function isActivityType(value: string): value is ActivityType {
  return (ACTIVITY_TYPES as readonly string[]).includes(value);
}

/** Etiquetas en pt para emails internos y el dashboard. */
export const ACTIVITY_LABELS_PT: Record<ActivityType, string> = {
  salao: 'Salão de beleza',
  estetica: 'Centro de estética',
  spa: 'Spa',
  clinica: 'Clínica',
  ginasio: 'Ginásio / wellness',
  solario: 'Estúdio de bronzeamento',
  outro: 'Outro',
};
