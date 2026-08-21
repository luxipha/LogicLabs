// Prefixes every rule in a lesson stylesheet with its scope class so multiple
// lesson stylesheets can coexist in one bundle without class-name collisions.
// Writes `<name>.scoped.css` next to each source; sources stay canonical and
// the script stays idempotent.
//
// Uses a brace-balanced tokenizer so @keyframes (kept verbatim) and
// @media/@supports (scoped inside) blocks are handled correctly.
import fs from 'node:fs/promises';

const SCOPES = new Map([
  ['.plane-app', ['src/lessons/airplane/lesson.css']],
  ['.butterfly-app', ['src/lessons/butterfly/lesson.css']],
  ['.generic-app', ['src/lessons/generic/lesson.css']],
]);

export const run = async () => {
  for (const [scope, files] of SCOPES) {
    for (const file of files) {
      const source = await fs.readFile(file, 'utf8');
      const out = scopeCss(source, scope);
      const outFile = file.replace(/\.css$/, '.scoped.css');
      await fs.writeFile(outFile, out, 'utf8');
      console.log(`Scoped ${file} -> ${outFile}`);
    }
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}

const scopeCss = (css, scope) => {
  const out = [];
  let i = 0;
  const len = css.length;

  while (i < len) {
    // Skip whitespace/newlines between rules.
    if (/[\s\n]/.test(css[i])) {
      out.push(css[i]);
      i += 1;
      continue;
    }

    // Preserve comments without treating them as part of the next selector.
    if (css.startsWith('/*', i)) {
      const commentEnd = css.indexOf('*/', i + 2);
      if (commentEnd === -1) {
        out.push(css.slice(i));
        break;
      }
      out.push(css.slice(i, commentEnd + 2));
      i = commentEnd + 2;
      continue;
    }

    // @-rule block: capture it whole with balanced braces.
    if (css[i] === '@') {
      const blockStart = i;
      i += 1;
      while (i < len && css[i] !== '{') i += 1;
      if (i >= len) break;
      const head = css.slice(blockStart, i + 1); // include the '{'
      const bodyStart = i + 1;
      i = bodyStart;
      let depthCount = 1;
      while (i < len && depthCount > 0) {
        if (css[i] === '{') depthCount += 1;
        else if (css[i] === '}') depthCount -= 1;
        i += 1;
      }
      const body = css.slice(bodyStart, i - 1);

      if (head.trimStart().startsWith('@keyframes')) {
        // Keyframes stay verbatim (frame percentages must not be prefixed).
        out.push(`${head}${body}}`);
      } else {
        // @media/@supports: scope the inner rules.
        out.push(`${head}${scopeCss(body, scope)}}`);
      }
      continue;
    }

    // Ordinary rule: read until '{', then capture balanced body.
    const selectorStart = i;
    while (i < len && css[i] !== '{') i += 1;
    if (i >= len) {
      out.push(css.slice(selectorStart));
      break;
    }
    const selector = css.slice(selectorStart, i).trim();
    const bodyStart = i + 1;
    i = bodyStart;
    let depthCount = 1;
    while (i < len && depthCount > 0) {
      if (css[i] === '{') depthCount += 1;
      else if (css[i] === '}') depthCount -= 1;
      i += 1;
    }
    const body = css.slice(bodyStart, i - 1);

    const scoped = selector
      .split(',')
      .map((sel) => scopeSelector(sel.trim(), scope))
      .join(', ');
    out.push(`${scoped}{${body}}`);
  }

  return out.join('');
};

const scopeSelector = (selector, scope) => {
  if (selector.startsWith('@')) {
    return selector;
  }
  if (selector === scope || selector.startsWith(`${scope} `) || selector.startsWith(`${scope}:`)) {
    return selector;
  }
  if (selector.startsWith(':')) {
    return selector;
  }
  if (selector.startsWith('&')) {
    return `${scope}${selector.slice(1)}`;
  }
  return `${scope} ${selector}`;
};
