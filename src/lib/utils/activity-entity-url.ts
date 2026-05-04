/**
 * Resolves entity type + id to an app path for linking from activity logs.
 * Pass basePath e.g. "/app/support" or "/app/client" depending on context.
 */
export function getEntityUrl(
  entityType: string | undefined,
  entityId: string | undefined,
  basePath: string = '/app/support'
): string | null {
  if (!entityType || !entityId) return null;
  const type = String(entityType).toLowerCase();
  const pathMap: Record<string, string> = {
    candidate: `${basePath}/candidates`,
    job_posting: `${basePath}/clients`,
    job_application: `${basePath}/applications`,
    client: `${basePath}/clients`,
    partner: `${basePath}/partners`,
    user: `${basePath}/users`,
    company: `${basePath}/clients`,
  };
  const segment = pathMap[type];
  if (!segment) return null;
  return `${segment}/${entityId}`;
}
