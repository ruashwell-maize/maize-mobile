import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { COLORS } from '@/constants/theme';

type Props = {
  children:    React.ReactNode;
  screenName?: string;
};

type State = {
  error:     Error | null;
  errorInfo: React.ErrorInfo | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(
      `[ErrorBoundary${this.props.screenName ? ` · ${this.props.screenName}` : ''}]`,
      'message:', error.message,
      '\nstack:', error.stack,
      '\ncomponentStack:', info.componentStack,
    );
    this.setState({ errorInfo: info });
  }

  reset = () => this.setState({ error: null, errorInfo: null });

  render() {
    if (!this.state.error) return this.props.children;

    const { error, errorInfo } = this.state;
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.warmWhite }}
        contentContainerStyle={{ padding: 20, paddingTop: 60 }}
      >
        <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.danger, marginBottom: 8 }}>
          Something went wrong
        </Text>
        <Text style={{ fontSize: 13, color: COLORS.n700, marginBottom: 16 }}>
          {this.props.screenName ? `Screen: ${this.props.screenName}` : 'Unhandled error'}
        </Text>

        <View
          style={{
            backgroundColor: '#fff', borderRadius: 10,
            borderWidth: 1, borderColor: COLORS.n200,
            padding: 12, marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.n500, marginBottom: 4 }}>
            ERROR
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.n900, fontFamily: 'Courier' }}>
            {error.message}
          </Text>
        </View>

        {error.stack ? (
          <View
            style={{
              backgroundColor: '#fff', borderRadius: 10,
              borderWidth: 1, borderColor: COLORS.n200,
              padding: 12, marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.n500, marginBottom: 4 }}>
              STACK
            </Text>
            <Text style={{ fontSize: 10.5, color: COLORS.n700, fontFamily: 'Courier' }}>
              {error.stack.split('\n').slice(0, 12).join('\n')}
            </Text>
          </View>
        ) : null}

        {errorInfo?.componentStack ? (
          <View
            style={{
              backgroundColor: '#fff', borderRadius: 10,
              borderWidth: 1, borderColor: COLORS.n200,
              padding: 12, marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: COLORS.n500, marginBottom: 4 }}>
              COMPONENT STACK
            </Text>
            <Text style={{ fontSize: 10.5, color: COLORS.n700, fontFamily: 'Courier' }}>
              {errorInfo.componentStack.split('\n').slice(0, 8).join('\n')}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={this.reset}
          style={{
            height: 48, borderRadius: 12, backgroundColor: COLORS.primary,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Try again</Text>
        </Pressable>
      </ScrollView>
    );
  }
}
