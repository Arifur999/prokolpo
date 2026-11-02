import { z } from "zod";

// The one place the app imports zod from (lint-enforced).
// jitless: zod v4 probes `new Function` when a schema is built. Under a CSP without
// 'unsafe-eval' the probe is blocked and every page reports a violation, which buries real ones.
// Harmless without a CSP, so it is on from day one.
z.config({ jitless: true });

export { z };
