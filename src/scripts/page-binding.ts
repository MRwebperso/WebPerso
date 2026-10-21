/**
 * Lligada dels guions de client a cada pàgina.
 *
 * Amb el `ClientRouter`, una navegació no recarrega el document: en canvia el
 * cos. Un guió de mòdul s'executa una sola vegada, o sigui que el que lliga
 * elements de la pàgina s'ha de tornar a fer a cada `astro:page-load`, que
 * també arriba a la primera càrrega. Per això cap guió no es crida
 * directament: la crida directa duplicava la lligada (constatat el 9/10/2026,
 * `a6b6a6c`).
 *
 * Cada lligada nova desfà l'anterior abans de començar: avorta el senyal que
 * havia rebut —els oients que hi anaven lligats es treuen sols— i crida les
 * neteges que havia apuntat, que són per al que un senyal no tanca:
 * `IntersectionObserver.disconnect()`, `cancelAnimationFrame()`. Sense això,
 * els observadors de la pàgina anterior continuaven vius sobre elements que ja
 * no són al document.
 *
 * Fins al 21/10/2026 cada guió ho explicava i ho feia pel seu compte, de tres
 * maneres: amb `AbortController` (casos, oferta), sense desfer res
 * (cronologia, revelació en scroll) o sense necessitat (contacte, que només
 * escolta elements de la pàgina).
 */

export interface Binding {
  /** S'avorta quan la pàgina canvia: per als oients de `window`, `document` i `matchMedia`. */
  signal: AbortSignal;
  /** Apunta una neteja per al que un senyal no tanca (observadors, fotogrames). */
  cleanup(fn: () => void): void;
}

export function onEveryPage(bind: (binding: Binding) => void): void {
  let undo: (() => void) | null = null;
  document.addEventListener('astro:page-load', () => {
    undo?.();
    const controller = new AbortController();
    const cleanups: (() => void)[] = [];
    undo = () => {
      controller.abort();
      for (const fn of cleanups.splice(0)) fn();
    };
    bind({ signal: controller.signal, cleanup: (fn) => cleanups.push(fn) });
  });
}
