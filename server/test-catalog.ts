import ts from 'typescript';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TestRequirement } from '../src/lib/test-results.ts';

// Read syntax only: learner tests are never executed by the API.
export function parseTestCatalog(source: string, filename: string): Record<string, TestRequirement[]> {
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const diagnostics = (file as ts.SourceFile & { parseDiagnostics: readonly ts.Diagnostic[] }).parseDiagnostics;
  if (diagnostics.length) throw new Error(`${filename}: テストの構文を確認してください。`);
  const catalog: Record<string, TestRequirement[]> = {};
  function rootName(expression: ts.Expression): string | undefined {
    if (ts.isIdentifier(expression)) return expression.text;
    if (ts.isPropertyAccessExpression(expression)) return rootName(expression.expression);
    return undefined;
  }
  function visit(node: ts.Node, chapter?: string) {
    if (ts.isCallExpression(node)) {
      const name = rootName(node.expression);
      const title = node.arguments[0];
      if (title && ts.isStringLiteralLike(title)) {
        if (name === 'describe') chapter = title.text.match(/^\[([a-z]+-\d+)\]/)?.[1] ?? chapter;
        if (chapter && (name === 'it' || name === 'test')) {
          const match = title.text.match(/^\[([^\]]+)\]\s*(.*)$/s);
          if (match && match[1].startsWith(`${chapter}-`)) {
            const entries = catalog[chapter] ??= [];
            if (entries.some(entry => entry.id === match[1])) throw new Error(`${filename}: 要件ID ${match[1]} が重複しています。`);
            entries.push({ id: match[1], title: match[2] });
          }
        }
      }
    }
    ts.forEachChild(node, child => visit(child, chapter));
  }
  visit(file);
  return catalog;
}
export async function readTestCatalog() {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const catalog: Record<string, TestRequirement[]> = {};
  for (const name of ['src/exercises/chapters.test.tsx', 'server/exercises.test.ts']) {
    const parsed = parseTestCatalog(await readFile(resolve(root, name), 'utf8'), name);
    for (const [chapter, entries] of Object.entries(parsed)) {
      const previous = catalog[chapter] ?? [];
      if (entries.some(entry => previous.some(old => old.id === entry.id))) throw new Error(`${chapter}: 要件IDが重複しています。`);
      catalog[chapter] = [...previous, ...entries];
    }
  }
  return catalog;
}
