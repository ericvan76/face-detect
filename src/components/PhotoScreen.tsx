import { ImagePicker, takeSnapshotAsync } from 'expo';
import { Button, Icon, Spinner } from 'native-base';
import React from 'react';
import { ActionSheetIOS, Alert, Dimensions, Platform, View } from 'react-native';
import { NavigationAction, NavigationScreenProp, StackNavigatorScreenOptions } from 'react-navigation';

import { faceDetect, FaceResult } from '../api/face';
import { TaggedPhoto } from './TaggedPhoto';

const { height, width } = Dimensions.get('window');

interface NavState {
  params: {
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
  error?: Error;
}

export class PhotoScreen extends React.PureComponent<Props, State> {

  public static navigationOptions: StackNavigatorScreenOptions = {
    title: 'Face Detect'
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
      Alert.alert('Ooops!', this.state.error.message, [{
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
          justifyContent: 'center',
          backgroundColor: '#000'
        }}>
        <TaggedPhoto
          ref="image"
          imageUri={image.uri}
          faceResults={this.state.faceResults}
          style={{ width: imageSize, height: imageSize, marginBottom: 40 }} />
        {
          this.state.isRequesting ?
            <View
              style={{
                position: 'absolute',
                alignSelf: 'center',
                backgroundColor: '#000',
                opacity: 0.8,
                borderRadius: 20,
                paddingLeft: 25,
                paddingRight: 25
              }}>
              <Spinner color="#ccc" />
            </View>
            : null
        }
        {
          this.state.faceResults !== undefined && Platform.OS === 'ios' ?
            <Button
              light transparent
              onPress={this.showShareActionSheet}
              style={{
                position: 'absolute',
                alignSelf: 'center',
                bottom: 10,
                paddingLeft: 26
              }}>
              <Icon name="share" style={{ fontSize: 35 }} />
            </Button>
            : null
        }
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
      const response: Array<FaceResult> = await faceDetect(base64);
      this.setState((state: State) => ({ ...state, isRequesting: false, faceResults: response }));
    } catch (e) {
      this.setState((state: State) => ({ ...state, isRequesting: false, error: e }));
    }
  }

  private showShareActionSheet = async (): Promise<void> => {
    // tslint:disable-next-line:no-any
    const fileToShare: string = await takeSnapshotAsync(this.refs.image as any, {
      format: 'jpeg',
      quality: 1,
      result: 'file',
      height: width,
      width
    });
    ActionSheetIOS.showShareActionSheetWithOptions(
      { url: fileToShare },
      (error: Error): void => { Alert.alert('Ooops!', error.message); },
      (): void => { return; }
    );
  }
}
