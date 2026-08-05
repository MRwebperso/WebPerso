/**
 * Peces compartides de les dues rutes que autentiquen el CMS contra GitHub.
 *
 * El prefix `_` és el que manté aquest fitxer fora de l'encaminador d'Astro: és
 * codi de suport, no una ruta.
 *
 * Context: el rerefons `git-gateway` de Decap és de Netlify i aquí no serveix.
 * A Vercel, Decap demana el rerefons `github`, i això vol dir una aplicació
 * OAuth de GitHub i un punt d'arribada propi que faci l'intercanvi del codi pel
 * testimoni —el secret del client no pot passar pel navegador.
 *
 * Els textos visibles d'aquestes dues pàgines són en català i prou. No formen
 * part del lloc: són pàgines de trànsit d'una finestra emergent que es tanca
 * tota sola, no tenen ruta mirall ni entren al contracte lingüístic.
 */

/** Nom del proveïdor, tal com l'espera el protocol de Decap. */
export const PROVIDER = 'github';

/** Galeta d'estat: viu deu minuts i només serveix per a la comprovació CSRF. */
export const STATE_COOKIE = 'decap-oauth-state';

/** Camí de retorn. Amb barra final, perquè `trailingSlash` del lloc és `always`. */
export const CALLBACK_PATH = '/api/callback/';

/**
 * Lectura per claudàtors i no per punt: Vite substitueix textualment els
 * accessos `process.env.X` que troba en compilació, i aquests valors s'han de
 * resoldre a l'execució, amb el que hi hagi a les variables d'entorn de Vercel.
 *
 * Una cadena buida es tracta com a absent: a Vercel és fàcil desar una variable
 * sense valor, i una configuració a mitges ha de fallar igual que una absent.
 */
export function readEnv(name: string): string | undefined {
  const value = process.env[name];
  return value !== undefined && value.length > 0 ? value : undefined;
}

/**
 * Resposta de text pla. És el que veu qui obre aquestes rutes a mà, i és també
 * el que fa visible una configuració incompleta en lloc de deixar-la en un 500
 * sense explicació —que és, de totes les maneres de fallar aquí, la pitjor.
 */
export function plainText(body: string, status: number): Response {
  return new Response(`${body}\n`, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

/** Falta una variable d'entorn. El missatge la nomena: aquí endevinar surt car. */
export function missingEnv(name: string): Response {
  return plainText(
    `Configuració incompleta: falta la variable d'entorn ${name}. ` +
      `S'ha de definir a Vercel (Settings → Environment Variables) i redesplegar.`,
    500,
  );
}

/**
 * Escapada del testimoni cap a dins de l'etiqueta `<script>`.
 *
 * Els dos separadors Unicode hi entren per seqüència d'escapada i no com a
 * caràcter: dins d'una classe de caràcters `\u2028` és vàlid, mentre que el
 * caràcter cru és un terminador de línia per a la gramàtica de JavaScript i en
 * un literal d'expressió regular no s'hi pot escriure.
 */
const SCRIPT_ESCAPES: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

const forScript = (value: string): string =>
  JSON.stringify(value).replace(
    /[<>&\u2028\u2029]/g,
    (char) => SCRIPT_ESCAPES[char] ?? char,
  );

const forHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Pàgina de tancament de la finestra emergent.
 *
 * L'encaix amb Decap és una encaixada de mans de tres missatges i l'ordre no és
 * negociable: la finestra emergent avisa l'obridora amb `authorizing:github`,
 * l'obridora li retorna el mateix missatge —i és així com la finestra emergent
 * sap a quin origen pot parlar— i només llavors s'envia el resultat. Enviar el
 * testimoni abans de l'eco voldria dir enviar-lo a `*`.
 *
 * El testimoni s'escriu al document, de manera que va escapat contra qualsevol
 * seqüència que en pugui tancar l'etiqueta. També hi ha text visible: si algú
 * arriba aquí sense finestra obridora, ha de saber què ha passat.
 */
function handshake(message: string, visible: string, status: number): Response {
  const body = `<!doctype html>
<html lang="ca">
  <head>
    <meta charset="utf-8" />
    <title>Autenticació del CMS</title>
    <meta name="robots" content="noindex, nofollow" />
    <style>
      body { font: 1rem/1.6 system-ui, sans-serif; margin: 3rem auto; max-width: 34rem; padding: 0 1.5rem; }
    </style>
  </head>
  <body>
    <p>${forHtml(visible)}</p>
    <script>
      (function () {
        var message = ${forScript(message)};
        if (!window.opener) return;
        function receive(event) {
          if (event.data !== 'authorizing:${PROVIDER}') return;
          window.removeEventListener('message', receive, false);
          window.opener.postMessage(message, event.origin);
        }
        window.addEventListener('message', receive, false);
        window.opener.postMessage('authorizing:${PROVIDER}', '*');
      })();
    </script>
  </body>
</html>
`;
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

/** Autenticació resolta: el testimoni torna a Decap i la finestra es tanca. */
export function authSuccess(token: string): Response {
  const payload = JSON.stringify({ token, provider: PROVIDER });
  return handshake(
    `authorization:${PROVIDER}:success:${payload}`,
    'Autenticat. Ja pots tancar aquesta finestra.',
    200,
  );
}

/**
 * Autenticació fallida. El motiu torna a Decap perquè surti a la interfície del
 * CMS: sense això, un error aquí es veuria com una finestra que no fa res.
 */
export function authError(reason: string, status = 400): Response {
  return handshake(
    `authorization:${PROVIDER}:error:${reason}`,
    `L'autenticació no s'ha completat: ${reason}`,
    status,
  );
}
