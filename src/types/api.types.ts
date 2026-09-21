// types/api.types.ts

// The Express API wraps responses as { success, message, ...payload } rather
// than the { status, message, data } envelope the BFF-backed apps return, and
// the payload key differs per endpoint. Services check this shape and unwrap
// to a plain domain object.
export interface ApiEnvelope {
  success: boolean;
  message: string;
}
