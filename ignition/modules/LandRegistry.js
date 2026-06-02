const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("LandRegistry", (m) => {
  const registry = m.contract("LandRegistry");
  return { registry };
});