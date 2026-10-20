/** Categories shown in the admin blog editor and public filters. */
export const blogCategories = [
  "All",
  "Convert",
  "Organize",
  "Optimize",
  "Edit",
  "Secure",
  "Guides",
] as const;

export type BlogCategory = (typeof blogCategories)[number];

export const DEFAULT_BLOG_CATEGORY = "Guides";
