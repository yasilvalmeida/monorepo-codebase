import { Logger } from '@nestjs/common';

export async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000,
  logger?: Logger,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < maxAttempts) {
        const waitTime = delay * Math.pow(2, attempt - 1);
        logger?.warn(
          `Attempt ${attempt} failed. Retrying in ${waitTime}ms...`,
          lastError.stack,
        );
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError;
}
