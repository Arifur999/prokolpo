import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { toActionError } from "./actionError";

const apiError = (status: number, data: unknown) => {
  const response = { status, statusText: "", headers: {}, config: { headers: new AxiosHeaders() }, data } as AxiosResponse;
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, undefined, response);
};

describe("toActionError", () => {
  it("keeps the API's message and maps errorSource to fieldErrors", () => {
    const error = apiError(422, {
      success: false,
      message: "Check the highlighted fields.",
      errorSource: [{ path: "budget", message: "Must be positive." }],
    });

    expect(toActionError(error, "Could not save")).toEqual({
      success: false,
      message: "Check the highlighted fields.",
      fieldErrors: { budget: "Must be positive." },
    });
  });

  it("leaves fieldErrors out when errorSource is empty", () => {
    const error = apiError(404, { success: false, message: "Project not found.", errorSource: [] });

    expect(toActionError(error, "Could not load")).toEqual({ success: false, message: "Project not found." });
  });

  it("uses the fallback when the API sent no message", () => {
    expect(toActionError(apiError(500, {}), "Could not save")).toEqual({ success: false, message: "Could not save" });
  });

  it("says the server was unreachable when there is no response", () => {
    const error = new AxiosError("Network Error", "ERR_NETWORK");

    expect(toActionError(error, "Could not save").message).toBe("Unable to reach the server. Please try again.");
  });
});
