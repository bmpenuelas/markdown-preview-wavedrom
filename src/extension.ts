import * as vscode from "vscode";
import { workspace } from "vscode";
import * as WaveDrom from "wavedrom";
import MarkdownIt from "markdown-it";

// Extension configuration
const config = workspace.getConfiguration("markdown-preview-wavedrom");

export async function activate() {
  // Output channel for debugging
  let channel = vscode.window.createOutputChannel("markdown-preview-wavedrom");
  channel.appendLine("Markdown Preview WaveDrom extension activated.");

  // Read settings
  let diagramPrefix = config.get<string>("prefix", "").toLowerCase();

  // Watch for config changes
  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("markdown-preview-wavedrom")) {
      diagramPrefix = config.get<string>("prefix", "").toLowerCase();
      channel.appendLine(`Config updated, the prefix is ${diagramPrefix}`);
    }
  });

  // Extend Markdown preview
  return {
    extendMarkdownIt(md: MarkdownIt) {
      const defaultFence = md.renderer.rules.fence!.bind(md.renderer.rules);

      md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx];
        let lang = token.info.trim().toLowerCase().split(" ")[0];

        // Handle prefix if configured
        if (diagramPrefix && lang.startsWith(diagramPrefix)) {
          lang = lang.slice(diagramPrefix.length);
        }

        if (lang === "wavedrom") {
          channel.appendLine("Rendering WaveDrom diagram...");
          try {
            const json = JSON.parse(token.content.trim());
            const svg = renderWaveDrom(json);
            return `<div class="wavedrom">${svg}</div>`;
          } catch (err: any) {
            channel.appendLine(`WaveDrom rendering failed: ${err.message}`);
            return `<pre style="color: red;">WaveDrom error: ${err.message}</pre>`;
          }
        }

        return defaultFence(tokens, idx, options, env, slf);
      };

      return md;
    },
  };
}

// Renders WaveDrom JSON into inline SVG
function renderWaveDrom(json: any): string {
  // WaveDrom.renderWaveJSON expects a diagram ID to attach SVG to,
  // but we can trick it to return the raw SVG string.
  const container = { innerHTML: "" } as any;
  const windowStub = {
    document: {
      getElementById: (_: string) => container,
    },
  };

  // Temporarily replace global document
  const oldDoc = (global as any).document;
  (global as any).document = windowStub.document;

  try {
    WaveDrom.renderWaveJSON(json, "wavedrom");
    return container.innerHTML;
  } finally {
    (global as any).document = oldDoc;
  }
}
