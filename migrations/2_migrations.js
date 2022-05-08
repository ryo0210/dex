const ERC20 = artifacts.require("ERC20");
const Dex = artifacts.require("Dex");

// 1 eth = 10^18 wei
const toWei = (number) => web3.utils.toWei(web3.utils.toBN(number), 'ether');

module.exports = async function (deployer) {
  await deployer.deploy(ERC20, "Dai", "DAI", toWei((10 ** 10)));
  const dai = await ERC20.deployed();
  await deployer.deploy(ERC20, "Chainlink", "LINK", toWei((10 ** 6)));
  const link = await ERC20.deployed();
  await deployer.deploy(ERC20, "Compound", "COMP", toWei((10 ** 4)));
  const comp = await ERC20.deployed();

  await deployer.deploy(Dex, [dai.address, link.address, comp.address]);
  const dex = await Dex.deployed();

  await dai.transfer(dex.address, toWei(10 ** 10));
  await link.transfer(dex.address, toWei(10 ** 6));
  await comp.transfer(dex.address, toWei(10 ** 4));
};

// npx truffle compile
// npx truffle develop
// migrate
// const dex = await Dex.deployed();
// const comp = await ERC20.deployed();
// comp.name();
// const link = await ERC20.at("{contract address}");
// const dai = await ERC20.at("{contract address}");
// let totalSupply = await dai.totalSupply();
// totalSupply.toString();
// await dex.buyToken(dai.address, '100', '10000', {from: accounts[3], value: '100'})
// let daiBalance = await dai.balanceOf(accounts[3]);
// daiBalance.toString();
