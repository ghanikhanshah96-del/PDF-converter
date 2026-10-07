const TOOL_PREFIXES = [
  "/pdf-to-",
  "/word-to-",
  "/excel-to-",
  "/jpg-to-",
  "/merge-pdf",
  "/split-pdf",
  "/compress-pdf",
  "/edit-pdf",
  "/sign-pdf",
  "/rotate-pdf",
  "/unlock-pdf",
  "/pdf-password-remover",
];

function isToolPath(path: string): boolean {
  return TOOL_PREFIXES.some(
    (p) => path === p || path.startsWith(p) || path.startsWith(`${p}-`),
  );
}

/** Match current pathname to a nav/footer href for active styling. */
export function isNavActive(pathname: string, href: string): boolean {
  const path = pathname.split("?")[0] || "/";
  const clean = href.split("#")[0] || "/";

  if (href === "/#tools" || clean === "/#tools") {
    return path === "/" || isToolPath(path);
  }

  if (clean === "/") {
    return path === "/";
  }

  if (clean === "/blog") {
    return path === "/blog" || path.startsWith("/blog/");
  }

  return path === clean || path.startsWith(`${clean}/`);
}
