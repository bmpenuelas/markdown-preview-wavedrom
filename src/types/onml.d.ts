declare module "onml" {
  /**
   * Serialize an ONML object tree into an SVG/XML string.
   * @param tree The ONML tree returned by WaveDrom
   */
  export function s(tree: any): string;
}
