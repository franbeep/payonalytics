export const buildParams = (
  paramList: Record<string, string | number | boolean>,
) =>
  `?${Object.keys(paramList)
    .map(param => `${param}=${encodeURIComponent(paramList[param])}`)
    .join('&')}`;
