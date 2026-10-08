"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Rendered instead of the children after a render error. */
  fallback: (reset: () => void) => ReactNode;
  /** When this value changes, a caught error is cleared and the children retried. */
  resetKey?: unknown;
}

/**
 * Contains a render error to one part of the screen, so a single bad value
 * never blanks the whole app. Used around every document render (preview,
 * print, thumbnails) and around the builder as a last line of defence.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  componentDidUpdate(previous: ErrorBoundaryProps) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) {
      this.setState({ failed: false });
    }
  }

  reset = () => this.setState({ failed: false });

  render() {
    return this.state.failed ? this.props.fallback(this.reset) : this.props.children;
  }
}
