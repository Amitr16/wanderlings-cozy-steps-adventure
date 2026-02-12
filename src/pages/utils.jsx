export function createPageUrl(pageName, params) {
  let url = `/${pageName}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  return url;
}