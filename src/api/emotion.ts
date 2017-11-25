import { ApiKey, getApiKey } from '../apiSelector';
import { b64toBinary } from '../utils';
import { EmotionResult } from './types';

export async function postRecognizeEmotion(base64: string): Promise<Array<EmotionResult>> {
  const apiKey: ApiKey = getApiKey('Emotion');

  const url: string = `${apiKey.url}/recognize`;
  const headers: Headers = new Headers();
  headers.append('Content-Type', 'application/octet-stream');
  headers.append('Ocp-Apim-Subscription-Key', apiKey.key);

  const request: Request = new Request(
    url,
    {
      method: 'POST',
      body: b64toBinary(base64),
      headers
    }
  );

  const response: Response = await fetch(request);
  if (!response.ok) {
    throw new Error((await response.json()).error.message);
  }

  return response.json() as Promise<Array<EmotionResult>>;
}
