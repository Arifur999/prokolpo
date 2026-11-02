// Where to go once the second step passes: only a page inside the admin panel, else its home.
export const adminNext = (next: unknown) => (typeof next === "string" && /^\/admin(\/|$|\?)/.test(next) && !next.startsWith("//") ? next : "/admin");
