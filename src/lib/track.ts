
export function trackEvent(name: string, props?: Record<string, unknown>) {
  // TODO: wire to real analytics (PostHog/Segment). For now, this is a no-op.
  void name;
  void props;
}
