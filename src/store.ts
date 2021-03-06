import * as ImagePicker from 'expo-image-picker';
import { FreeGeoIpResult } from './api/freegeoip';
import { FaceResult, VisionResult } from './api/types';

export type AppMode = 'Face' | 'Vision';

export interface AppState {
  network: NetworkState;
  appMode: AppMode;
  processState: ProcessState;
}

export interface NetworkState {
  isConnected: boolean;
  adReceived: boolean;
  freeGeoIp: FreeGeoIpResult;
}

export type ProcessStatus = 'none' | 'picking' | 'ready' | 'requesting' | 'success' | 'error';

export interface ProcessResult {
  face?: Array<FaceResult>;
  vision?: VisionResult;
}

export interface ProcessState {
  status: ProcessStatus;
  image?: ImagePicker.ImagePickerResult;
  result?: ProcessResult;
  error?: Error;
}
