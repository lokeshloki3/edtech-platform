// types/api.types.ts

// Every endpoint answers { success, message }, plus a `data` payload when it has
// one. Services check `success` before unwrapping: the contact endpoint replies
// 200 on failure, so the flag — not the status code — is the only signal there.
export interface ApiEnvelope {
  success: boolean;
  message: string;
}

export interface ApiResponse<T> extends ApiEnvelope {
  data: T;
}
