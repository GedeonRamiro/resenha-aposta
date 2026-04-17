import { BadRequestException } from '@nestjs/common';

export const parseDateTime = (value: string, fieldName: string): Date => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`${fieldName} inválida`);
  }

  return parsed;
};

export const parseDateFilter = (
  value: string,
  bound: 'start' | 'end',
): Date => {
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);

  if (isDateOnly) {
    const [year, month, day] = value.split('-').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));

    if (bound === 'end') {
      utcDate.setUTCDate(utcDate.getUTCDate() + 1);
    }

    return utcDate;
  }

  return parseDateTime(value, 'Data de filtro');
};
