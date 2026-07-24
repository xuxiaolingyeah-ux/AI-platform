/**
 * 从首条用户消息中提取会话标题
 */
export function generateSessionTitle(firstMessage: string): string {
  const cleaned = firstMessage.trim();
  if (cleaned.length <= 20) return cleaned;
  return cleaned.slice(0, 20) + '...';
}
