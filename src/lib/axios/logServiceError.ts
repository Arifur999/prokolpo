import { isAxiosError } from "axios";
import { logger } from "@/lib/logger";

// Never log the axios error itself: error.config.headers holds the Bearer token
// and any forwarded cookies. This reads an allowlist of scalars only.
// 4xx is an expected outcome the UI handles (warn); 5xx and "no response" are errors.
export const logServiceError = (context: string, error: unknown) => {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const fields = {
      method: error.config?.method?.toUpperCase(),
      // Path only: query strings can carry search terms and tokens.
      path: error.config?.url?.split("?")[0],
      status: status ?? error.code ?? "NO_RESPONSE",
    };
    if (status !== undefined && status < 500) logger.warn(context, fields);
    else logger.error(context, fields);
    return;
  }
  logger.error(context, { message: error instanceof Error ? error.message : String(error) });
};
