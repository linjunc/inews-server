module.exports = async function (params, context) {
  const { s } = params;
  const min = Math.ceil(s / 60000);
  return min;
};
