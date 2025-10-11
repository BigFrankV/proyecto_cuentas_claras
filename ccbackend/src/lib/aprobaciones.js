function requiredApprovalsForAmount(monto) {
  if (!monto) return 1;
  if (monto > 2000000) return 3;
  if (monto > 500000) return 2;
  return 1;
}

module.exports = { requiredApprovalsForAmount };