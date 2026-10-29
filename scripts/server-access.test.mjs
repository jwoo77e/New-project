import { describe, expect, it } from "vitest";
import { createClientAllowlist } from "./server-access.mjs";

describe("company-network access", () => {
  it("preserves the unconfigured Railway listener", () => {
    expect(createClientAllowlist(undefined)("203.0.113.2")).toBe(true);
  });
  it("allows the office subnet and loopback, including mapped IPv4", () => {
    const allowed = createClientAllowlist("192.168.0.0/24,127.0.0.0/8,::1/128");
    for (const ip of ["192.168.0.15", "192.168.0.254", "::ffff:192.168.0.15", "127.0.0.1", "::1"])
      expect(allowed(ip), ip).toBe(true);
    for (const ip of ["192.168.1.15", "10.0.0.1", "203.0.113.2", "::ffff:203.0.113.2", "2001:db8::1", undefined])
      expect(allowed(ip), ip).toBe(false);
  });
  it("fails closed for malformed or empty configuration", () => {
    for (const cidrs of ["", "192.168.0.0", "192.168.0.0/33", "::1/129", "192.168.0.0/24,", "0.0.0.0/-1", "192.168.0.0/24/1"])
      expect(() => createClientAllowlist(cidrs), cidrs).toThrow();
  });
});
