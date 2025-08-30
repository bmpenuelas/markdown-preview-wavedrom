declare module "wavedrom" {
  interface WaveJSON {
    signal: { name: string; wave: string; data?: string[] }[];
    head?: string[];
    foot?: string[];
  }

  /**
   * Renders a WaveJSON diagram into an element.
   * @param waveJSON - The WaveDrom JSON diagram.
   * @param index - Element ID or index.
   */
  export function renderWaveJSON(waveJSON: WaveJSON, index: string | number): void;
}
