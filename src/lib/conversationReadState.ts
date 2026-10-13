export function markConversationsRead(
  previous: ReadonlySet<string>,
  conversations: readonly { id: string }[],
): Set<string> {
  return new Set([...previous, ...conversations.map((conversation) => conversation.id)]);
}