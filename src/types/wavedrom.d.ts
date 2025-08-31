declare module "wavedrom" {
  interface RenderOptions {
    config?: object;
    // You can expand this interface if you want stricter typing
  }

  export function renderAny(
    data: any,
    index?: number,
    options?: RenderOptions
  ): string;
}
