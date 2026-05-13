import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatFecha(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
  } catch (error) {
    return dateString;
  }
}
