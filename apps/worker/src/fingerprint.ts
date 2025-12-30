import crypto from "node:crypto";

export function computeFingerprint(
  exceptionType: string,
  stacktrace: string
): string {
  const topFrame = stacktrace.split("\n")[0] ?? "";
  const input = `${exceptionType}:${topFrame}`;

  return crypto
    .createHash("sha256")
    .update(input)
    .digest("hex");
}
