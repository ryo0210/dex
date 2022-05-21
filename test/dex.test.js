const Dai = artifacts.require("Dai");
const Dex = artifacts.require("Dex");

const BN = require("bn.js");
const chai = require("chai");
const { expect } = chai;
chai.use(require("chai-bn")(BN));

const truffleAssert = require("truffle-assertions");

contract("dex test", (accounts) => {
    let dai, dex;

    const owner = accounts[0];
    const alice = accounts[1];

    before(async () => {
        dai = await Dai.deployed();
        dex = await Dex.deployed();

        await dai.transfer(dex.address, await dai.totalSupply());
    });

    describe("Buy token test", () => {
        it("Should revert when invalid token address is entered", async () => {
            const fake_token_address = accounts[8]
            await truffleAssert.reverts(dex.buyToken(fake_token_address, "1", "1", {value: "1"}))
        });
        it("Should pass when every paramter is valid", async () => {
            await truffleAssert.passes(dex.buyToken(dai.address, "100", "1000", {value: "100", from: alice}))
        });
        it("Should update dex and alice balance after buying", async () => {
            const alices_dai = await dai.balanceOf(alice);
            const dex_eth = await web3.eth.getBalance(dex.address);

            expect(alices_dai).to.be.bignumber.equal(new BN(1000));
            expect(dex_eth).to.be.equal("100");
        });
    });
    describe("Sell token test", async () => {
        it("Should only pass if alice approved token transfer", async () => {
            await truffleAssert.reverts(
                dex.sellToken(dai.address, 10, 99, {from: alice})
            );

            await dai.approve(dex.address, 99, {from: alice})

            await truffleAssert.passes(
                dex.sellToken(dai.address, 10, 99, {from: alice})
            );
        });
    });
});