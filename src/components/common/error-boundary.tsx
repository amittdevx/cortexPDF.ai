/**
 * ErrorBoundary — catches render-time crashes and shows a calm recovery screen
 * instead of a redbox / blank app ("NEVER CRASH APP"). Logs through the central
 * logger so the error reaches Sentry once that's wired up.
 */

import { Component, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { createLogger } from '@/utils/logger';

import { Button } from '../buttons/button';
import { EmptyState } from './empty-state';

const log = createLogger('error-boundary');

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    log.error(error.message, { stack: error.stack, componentStack: info.componentStack });
  }

  private reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <EmptyState
            icon="alert-circle-outline"
            title="Something went wrong"
            message="The app hit an unexpected error. You can try again — your files and data are safe."
          />
          <Button label="Try again" onPress={this.reset} style={styles.button} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  button: { marginTop: 8 },
});
