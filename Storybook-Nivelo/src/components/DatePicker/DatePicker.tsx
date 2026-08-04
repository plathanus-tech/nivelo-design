import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../Button/Button';
import styles from './DatePicker.module.css';

export interface DateRangeValue { start: Date | null; end: Date | null; }

export interface DatePickerProps {
  mode?: 'single' | 'range';
  value?: DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  label?: string;
  placeholder?: string;
}

const MONTH_NAMES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function pad2(n: number) { return n < 10 ? '0' + n : String(n); }
function formatDatePt(date: Date) { return pad2(date.getDate()) + '/' + pad2(date.getMonth() + 1) + '/' + date.getFullYear(); }
function sameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function capitalize(text: string) { return text.charAt(0).toUpperCase() + text.slice(1); }

// Componente extraído do Popover+calendário já usado (composição própria de
// página, sem componente dedicado) em `cadastros.html`/Dashboard — ver
// app/rules.md do protótipo estático. `mode="single"` aplica no primeiro
// clique; `mode="range"` mantém o mecanismo de 2 cliques (início/fim) +
// Cancelar/Aplicar já usado nessas telas.
export function DatePicker({ mode = 'single', value, onChange, label, placeholder = 'Selecionar data' }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRangeValue>({ start: value?.start ?? null, end: value?.end ?? null });
  const [viewYear, setViewYear] = useState((value?.start ?? new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState((value?.start ?? new Date()).getMonth());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function openPicker() {
    const base = value?.start ?? new Date();
    setDraft({ start: value?.start ?? null, end: value?.end ?? null });
    setViewYear(base.getFullYear());
    setViewMonth(base.getMonth());
    setOpen(true);
  }

  function pickDate(date: Date) {
    if (mode === 'single') {
      const next = { start: date, end: date };
      setDraft(next);
      onChange?.(next);
      setOpen(false);
      return;
    }
    let next: DateRangeValue;
    if (!draft.start || (draft.start && draft.end)) {
      next = { start: date, end: null };
    } else if (date < draft.start) {
      next = { start: date, end: draft.start };
    } else {
      next = { start: draft.start, end: date };
    }
    setDraft(next);
  }

  function apply() {
    if (mode === 'range' && (!draft.start || !draft.end)) return;
    onChange?.(draft);
    setOpen(false);
  }

  function goToMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
  }

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const days: Array<Date | null> = [];
  for (let e = 0; e < firstWeekday; e++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(viewYear, viewMonth, d));

  const hasValue = mode === 'range' ? Boolean(value?.start && value?.end) : Boolean(value?.start);
  const triggerText = mode === 'range'
    ? (value?.start && value?.end ? formatDatePt(value.start) + ' até ' + formatDatePt(value.end) : placeholder)
    : (value?.start ? formatDatePt(value.start) : placeholder);

  return (
    <div ref={ref} className={styles.dpRoot}>
      {label && <span className={`${styles.dpLabel} text-16-bold`}>{label}</span>}
      <button type="button" className={`${styles.dpTrigger} text-body-m`} onClick={() => (open ? setOpen(false) : openPicker())}>
        <span className={styles.dpTriggerIcon}><CalendarIcon size={16} /></span>
        <span className={hasValue ? '' : styles.dpPlaceholder}>{triggerText}</span>
      </button>
      {open && (
        <div className={styles.dpPopover}>
          <div className={styles.dpCalendarHeader}>
            <button type="button" className={styles.dpNavBtn} aria-label="Mês anterior" onClick={() => goToMonth(-1)}>
              <ChevronLeft size={16} />
            </button>
            <span className={`${styles.dpCalendarLabel} text-body-s`}>{capitalize(MONTH_NAMES[viewMonth])} de {viewYear}</span>
            <button type="button" className={styles.dpNavBtn} aria-label="Próximo mês" onClick={() => goToMonth(1)}>
              <ChevronRight size={16} />
            </button>
          </div>
          <div className={styles.dpWeekdays}>
            {WEEKDAYS.map((w, i) => <span key={i} className="text-10-medium">{w}</span>)}
          </div>
          <div className={styles.dpGrid}>
            {days.map((date, i) => {
              if (!date) return <span key={i} className={styles.dpDayEmpty} />;
              const isStart = draft.start ? sameDay(date, draft.start) : false;
              const isEnd = draft.end ? sameDay(date, draft.end) : false;
              const inRange = mode === 'range' && draft.start && draft.end ? date > draft.start && date < draft.end : false;
              const classes = [styles.dpDay, 'text-12-regular', isStart || isEnd ? styles.dpDaySelected : '', inRange ? styles.dpDayInRange : ''].filter(Boolean).join(' ');
              return <button key={i} type="button" className={classes} onClick={() => pickDate(date)}>{date.getDate()}</button>;
            })}
          </div>
          {mode === 'range' && (
            <div className={styles.dpActions}>
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="primary" size="sm" onClick={apply}>Aplicar</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
