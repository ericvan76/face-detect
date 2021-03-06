/* eslint-disable import/prefer-default-export */
import { decode } from 'base-64';

export function base64ToBinary(b64Data: string): Uint8Array {
  const byteCharacters: string = decode(b64Data);
  const byteNumbers: Array<number> = [];
  for (let i: number = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  return new Uint8Array(byteNumbers);
}
