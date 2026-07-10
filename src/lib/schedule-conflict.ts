export type ScheduleBlock = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  label: string;
};

export type ScheduleConflict = {
  classBlock: ScheduleBlock;
  internshipBlock: ScheduleBlock;
};

const DAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function dayLabel(dayOfWeek: number): string {
  return DAY_LABELS[dayOfWeek] ?? "Dia inválido";
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

function overlaps(a: ScheduleBlock, b: ScheduleBlock): boolean {
  if (a.dayOfWeek !== b.dayOfWeek) return false;
  const aStart = toMinutes(a.startTime);
  const aEnd = toMinutes(a.endTime);
  const bStart = toMinutes(b.startTime);
  const bEnd = toMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

export function findScheduleConflicts(
  classBlocks: ScheduleBlock[],
  internshipBlocks: ScheduleBlock[]
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  for (const classBlock of classBlocks) {
    for (const internshipBlock of internshipBlocks) {
      if (overlaps(classBlock, internshipBlock)) {
        conflicts.push({ classBlock, internshipBlock });
      }
    }
  }
  return conflicts;
}
