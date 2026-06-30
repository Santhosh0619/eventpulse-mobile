/**
 * Shared FlatList performance props. Spread into long lists to cap how much is
 * rendered/retained off-screen. (No getItemLayout: row heights vary by content.)
 */
export const listPerf = {
  removeClippedSubviews: true,
  windowSize: 7,
  initialNumToRender: 8,
  maxToRenderPerBatch: 8,
} as const
