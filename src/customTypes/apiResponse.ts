export type APIResponse<T = object> =
  | { success: true; data: T }
  | { success: false; error: string };

export type TemplateMapping = { number: number; name: string };
