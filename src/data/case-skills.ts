/**
 * Vocabulari tancat de la intensitat d'ús d'una competència dins d'un cas.
 *
 * Mòdul propi per la mateixa raó que `case-kinds.ts`: el llegeixen l'esquema de
 * la col·lecció i les etiquetes de `src/data/cases.ts`.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ QUÈ MESURA, I SOBRETOT QUÈ NO                                            │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Mesura quant es va fer servir la competència EN AQUELL ENCÀRREC. No mesura
 * el domini de qui la signa. La distinció no és retòrica: una barra al 60 %
 * sobre «etnografia de camp» es llegeix com «l'hi falta un 40 %», que és
 * exactament el contrari del que ha de dir un portfolio. Per això:
 *
 * - **Tres graons i no un percentatge.** Un contínuu convida a llegir-lo com
 *   una nota; tres graons es llegeixen com el que són, una gradació.
 * - **Cinc osques i no una barra plena.** Una barra contínua torna a semblar
 *   un percentatge encara que a dins només hi hagi tres valors possibles.
 * - **Sense etiqueta de nivell a la targeta** (decisió de l'usuari,
 *   27/08/2026). La paraula hi és igualment, però només per a qui no veu la
 *   gradació: se serveix per `aria-label` des de `caseLabels`.
 */
export const skillUses = ['ocasional', 'regular', 'central'] as const;

export type SkillUse = (typeof skillUses)[number];

/**
 * Osques enceses sobre cinc.
 *
 * Cap valor no baixa d'una osca ni arriba a zero: si una competència s'ha
 * escrit a la fitxa és perquè va entrar a l'encàrrec. I `central` omple les
 * cinc —la gradació ha de tenir sostre, o el graó de dalt no es distingeix.
 */
export const skillNotches: Record<SkillUse, number> = {
  ocasional: 2,
  regular: 4,
  central: 5,
};

/** Osques que dibuixa la targeta, enceses o apagades. */
export const skillScale = [1, 2, 3, 4, 5] as const;
