export default async function (params: { s: number }) {
  const { s } = params;
  const min = Math.ceil(s / 60000);
  return min;
}
