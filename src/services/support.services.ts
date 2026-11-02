"use server";

import { httpClient } from "@/lib/axios/httpClient";
import type { ISupportReceipt, ISupportRequestPayload } from "@/types/support.types";

// httpClient sends the access token when there is one, so a signed-in request is linked to the account.
export const createSupportRequest = async (payload: ISupportRequestPayload) => httpClient.post<ISupportReceipt>("/support/requests", payload);
