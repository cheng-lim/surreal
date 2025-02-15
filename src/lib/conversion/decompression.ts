import { decode } from "@jsquash/avif";
import { PNG } from "pngjs";

export default async function decompress(
  avifData: Uint8Array
): Promise<Buffer<ArrayBufferLike>> {
  // Ensure we have a proper ArrayBuffer
  const buffer = avifData.buffer as ArrayBuffer;
  const decoded = await decode(buffer);
  const { width, height, data } = decoded; // data is a Uint8ClampedArray

  // Create a new PNG instance with the given dimensions
  const png = new PNG({ width, height });

  // Convert Uint8ClampedArray to Uint8Array explicitly:
  const rgbaData = new Uint8Array(
    data.buffer,
    data.byteOffset,
    data.byteLength
  );

  // Set the PNG data using a Buffer created from the Uint8Array
  png.data = Buffer.from(rgbaData);

  // Encode the PNG image to a Buffer (synchronously)
  const pngBuffer = PNG.sync.write(png);

  return pngBuffer;
}
