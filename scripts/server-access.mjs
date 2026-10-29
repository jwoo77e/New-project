import { BlockList, isIP } from "node:net";

// An unset allowlist preserves existing Railway behavior. Invalid configured
// ranges fail startup instead of accidentally making a restricted site public.
export function createClientAllowlist(cidrs) {
  if (cidrs === undefined) return () => true;
  const entries = cidrs.split(",").map((entry) => entry.trim());
  const allowed = new BlockList();
  for (const entry of entries) {
    const [address, prefix, extra] = entry.split("/");
    const family = isIP(address);
    const maxPrefix = family === 4 ? 32 : 128;
    if (!family || extra !== undefined || !/^\d+$/.test(prefix ?? "") || Number(prefix) > maxPrefix) {
      throw new Error("ALLOWED_CLIENT_CIDRS must contain valid comma-separated IP subnets.");
    }
    allowed.addSubnet(address, Number(prefix), family === 4 ? "ipv4" : "ipv6");
  }
  return (address) => {
    if (!address) return false;
    const family = isIP(address);
    return Boolean(family && allowed.check(address, family === 4 ? "ipv4" : "ipv6"));
  };
}
