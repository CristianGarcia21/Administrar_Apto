export const createId = (prefix) =>
  `${prefix}-${crypto.randomUUID().slice(0, 8)}`
