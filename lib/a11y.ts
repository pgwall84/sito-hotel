// Costante di classi Tailwind per lo stato di focus visibile, riusata da
// ogni elemento interattivo del sito (Punto 5, audit accessibilità,
// 27/08/2026). focus-visible (non focus): l'anello appare solo alla
// navigazione da tastiera, non al click del mouse. outline (proprietà CSS
// nativa) e non ring (box-shadow Tailwind) per non entrare in collisione
// con eventuali anelli di stato già esistenti sullo stesso elemento (es.
// il ring-1 ring-primary di DateRangePicker.tsx sul campo attivo).
export const focusRingClasses =
  "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
