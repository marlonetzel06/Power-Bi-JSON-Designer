/** DOM id of a format card (`data-card`), with an optional `$id` state suffix. */
export function cardDomId(visualKey: string, cardKey: string, stateId?: string): string {
  return `card-${visualKey}-${cardKey}${stateId ? `-${stateId}` : ''}`.replace(/[^a-zA-Z0-9_-]/g, '_');
}
