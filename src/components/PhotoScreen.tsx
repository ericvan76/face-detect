import { ImagePicker, takeSnapshotAsync } from 'expo';
import React from 'react';
import { ActionSheetIOS, ActivityIndicator, Alert, Dimensions, Platform, Text, View } from 'react-native';
import { NavigationAction, NavigationScreenProp, NavigationStackScreenOptions } from 'react-navigation';

import { detectEmotions } from '../api/emotion';
import { detectFaces } from '../api/face';
import { describeImage } from '../api/vision';
import { APP_MODE_EMOTION, APP_MODE_FACE, APP_MODE_VISION } from '../constants';
import { EmotionResult, FaceResult, VisionResult } from '../types/api';
import { AppMode } from '../types/common';
import { Button } from './Button';
import { TaggedPhoto } from './TaggedPhoto';

const { height, width } = Dimensions.get('window');

interface NavState {
  params: {
    mode: AppMode;
    image: ImagePicker.ImageInfo;
    fileToShare?: string;
  };
}

interface Props {
  navigation: NavigationScreenProp<NavState, NavigationAction>;
}

interface State {
  isRequesting: boolean;
  faceResults?: Array<FaceResult>;
  emotionResults?: Array<EmotionResult>;
  visionResult?: VisionResult;
  error?: Error;
}

export class PhotoScreen extends React.PureComponent<Props, State> {

  public static navigationOptions: NavigationStackScreenOptions = {
    title: 'Vision'
  };

  public state: State = {
    isRequesting: false
  };

  public componentDidMount(): void {
    this.setState((state: State) => ({ ...state, isRequesting: true }));
    setTimeout(this.process, 1000);
  }

  public render(): JSX.Element {
    if (this.state.error !== undefined) {
      Alert.alert('Oops!', this.state.error.message, [{
        text: 'OK', onPress: (): void => {
          this.setState((state: State) => ({ ...state, error: undefined }));
        }
      }]);
    }

    const { image } = this.props.navigation.state.params;
    const imageSize: number = Math.min(height, width);

    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#000000'
        }}>
        <View style={{
          flex: 0.9,
          justifyContent: 'center'
        }}>
          <TaggedPhoto
            ref="image"
            imageUri={image.uri}
            faceResults={this.state.faceResults}
            emotionResults={this.state.emotionResults}
            visionResult={this.state.visionResult}
            style={{
              width: imageSize,
              height: imageSize,
              justifyContent: 'center'
            }}
          />
          {
            this.state.isRequesting ?
              <View
                style={{
                  position: 'absolute',
                  alignSelf: 'center',
                  padding: 20,
                  borderRadius: 20,
                  opacity: 0.8,
                  backgroundColor: '#000000'
                }}
              >
                <ActivityIndicator size="large" />
                <Text
                  style={{
                    color: '#eeeeee',
                    fontSize: 12,
                    marginTop: 10
                  }}
                >Processing...</Text>
              </View>
              : null
          }
        </View>
        <View
          style={{
            flex: 0.1,
            justifyContent: 'flex-end'
          }}
        >
          {
            !this.state.isRequesting && Platform.OS === 'ios' ?
              <Button
                fontSize={28}
                icon="ios-share-outline"
                onPress={this.showShareActionSheet}
                style={{
                  alignSelf: 'center',
                  backgroundColor: '#000000'
                }}
              />
              : null
          }
        </View>
      </View>
    );
  }

  private process = async (): Promise<void> => {
    // tslint:disable-next-line:no-any
    const base64: string = await takeSnapshotAsync(this.refs.image as any, {
      format: 'jpeg',
      quality: 1,
      result: 'base64',
      height: width,
      width
    });
    try {
      const mode: AppMode = this.props.navigation.state.params.mode;
      switch (mode) {
        case APP_MODE_FACE: {
          const response: Array<FaceResult> = await detectFaces(base64);
          this.setState((state: State): State => ({ ...state, isRequesting: false, faceResults: response }));
          break;
        }
        case APP_MODE_EMOTION: {
          const response: Array<EmotionResult> = await detectEmotions(base64);
          this.setState((state: State): State => ({ ...state, isRequesting: false, emotionResults: response }));
          break;
        }
        case APP_MODE_VISION: {
          const response: VisionResult = await describeImage(base64);
          this.setState((state: State): State => ({ ...state, isRequesting: false, visionResult: response }));
          break;
        }
        default:
          return;
      }
    } catch (e) {
      this.setState((state: State) => ({ ...state, isRequesting: false, error: e }));
    }
  }

  private showShareActionSheet = async (): Promise<void> => {
    // tslint:disable-next-line:no-any
    const fileToShare: string = await takeSnapshotAsync(this.refs.image as any, {
      format: 'jpeg',
      quality: 1,
      result: 'data-uri',
      height: width,
      width: width
    });
    ActionSheetIOS.showShareActionSheetWithOptions(
      {
        url: fileToShare
      },
      (error: Error): void => {
        Alert.alert('Oops!', error.message);
      },
      (completed: boolean, _: string): void => {
        if (completed) {
          // Alert.alert('Shared!');
        }
      }
    );
  }
}
