/**
 * 模拟 SSE 流式输出
 * 将完整文本按 chunk 逐段输出，模拟打字效果
 */
export function simulateStream(
  fullText: string,
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  options?: { speed?: number; chunkSize?: number }
): { stop: () => void } {
  let index = 0;
  const speed = options?.speed ?? 25;
  const chunkSize = options?.chunkSize ?? 3;

  const timer = setInterval(() => {
    if (index >= fullText.length) {
      clearInterval(timer);
      onComplete();
      return;
    }
    const chunk = fullText.slice(index, index + chunkSize);
    index += chunkSize;
    onChunk(chunk);
  }, speed);

  return { stop: () => clearInterval(timer) };
}
