import * as vscode from "vscode";
import MarkdownIt from "markdown-it";
import * as wavedrom from "wavedrom";
import JSON5 from "json5";
import * as onml from "onml";

import def from "wavedrom/skins/default.js";
import narrow from "wavedrom/skins/narrow.js";
import lowkey from "wavedrom/skins/lowkey.js";

const skins = { ...def, ...narrow, ...lowkey };

export function activate(context: vscode.ExtensionContext) {
  const channel = vscode.window.createOutputChannel(
    "markdown-preview-wavedrom"
  );
  channel.appendLine("Markdown Preview WaveDrom extension activated");

  let diagramLanguageIdentifier = vscode.workspace
    .getConfiguration("markdown-preview-wavedrom")
    .get<string>("LanguageIdentifier", "wavedrom")
    .toLowerCase();

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("markdown-preview-wavedrom")) {
      diagramLanguageIdentifier = vscode.workspace
        .getConfiguration("markdown-preview-wavedrom")
        .get<string>("LanguageIdentifier", "wavedrom")
        .toLowerCase();
      channel.appendLine(
        `Config updated, LanguageIdentifier is ${diagramLanguageIdentifier}`
      );
    }
  });

  return {
    extendMarkdownIt(md: MarkdownIt) {
      const defaultFence = md.renderer.rules.fence!.bind(md.renderer.rules);

      md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx];
        const lang = token.info.trim().toLowerCase().split(" ")[0];

        if (lang === diagramLanguageIdentifier) {
          try {
            const waveformJson = token.content.trim();
            const json = JSON5.parse(waveformJson);

            // Render SVG using WaveDrom Node API
            const onmlTree = wavedrom.renderAny(0, json, skins); // Render first diagram
            const svg = onml.s(onmlTree);

            return `<div class="wavedrom-diagram">${svg}</div>`;
          } catch (err) {
            channel.appendLine(`Error rendering WaveDrom: ${err}`);
            return `<pre>Error rendering WaveDrom: ${err}</pre>`;
          }
        }

        return defaultFence(tokens, idx, options, env, slf);
      };

      channel.appendLine("WaveDrom renderer attached");
      return md;
    },
  };
}

export function deactivate() {}
