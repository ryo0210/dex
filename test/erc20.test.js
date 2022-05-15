const Dai = artifacts.require("Dai");
const Link = artifacts.require("Link");
const Comp = artifacts.require("Comp");

const BN = require("bn.js");
const chai = require("chai");
const { expect } = chai;
chai.use(require("chai-bn")(BN));

const truffleAssert = require("truffle-assertions");

contract("ERC20 token test", (accounts) => {
    let dai, link, comp;

    const owner = accounts[0];
    const alice = accounts[1];
    const bob = accounts[2];

    before(async () => {
        dai = await Dai.deployed();
        link = await Link.deployed();
        comp = await Comp.deployed();
    });

    describe("Supply", () => {
        it("should return token names and symbols correctly", async () => {
            expect(await dai.name()).to.equal("Dai");
            expect(await link.symbol()).to.equal("LINK");
        });
    })

    it("should have correct total supply", async () => {
        const ten_billion = web3.utils.toWei(web3.utils.toBN(10**10), 'ether');
        expect(await dai.totalSupply()).to.bignumber.equal(ten_billion);
    });

    // 1
    it("should have correct initial balances.", async () => {
        const ownerBalance = await dai.balanceOf(owner);
        const aliceBalance = await dai.balanceOf(alice);

        const zero = web3.utils.toWei(web3.utils.toBN(0), 'ether');
        const ten_billion = web3.utils.toWei(web3.utils.toBN(10**10), 'ether');

        expect(ownerBalance).to.bignumber.equal(ten_billion);
        expect(aliceBalance).to.bignumber.equal(zero);
    });

    it("should revert when transfer amount > balance", async () => {
        const ownerBalance = await comp.balanceOf(owner);
        const transferAmount = ownerBalance.add(new BN(1));
        await truffleAssert.reverts(comp.transfer(alice, transferAmount));
    });

    // 2
    it("should pass when transfer amount <= balance", async () => {
        const amount = web3.utils.toBN(1000);
        await dai.transfer(alice, amount);
    });

    it("should updated to the correct balances.", async () => {
        const totalSupply = await dai.totalSupply();
        const amount = web3.utils.toBN(1000);

        expect(await dai.balanceOf(alice)).to.bignumber.equal(amount);
        expect(await dai.balanceOf(owner)).to.bignumber.equal(totalSupply.sub(amount));
    });

    // 3
    before(async () => {
        dai.approve(bob, new BN(500), {from: alice});  // bobがaliceの500dai分動かすのを許可する
    });

    it("should revert when transfer amount > allowance", async () => {
        await truffleAssert.reverts(
            dai.transferFrom(alice, bob, new BN(501), {from: bob})  // bobが500動かそうとする
        );
    });

    // 4
    it("should faild when transfer not allowed", async () => {
        const allowanceAmount = await dai.allownance(alice, bob)
        await truffleAssert.fails(
            dai.transferFrom(owner, bob, allowanceAmount, {from: bob})
        );
    });

    it("should pass when transfer amount <= allowance", async () => {
        const allowanceAmount = await dai.allownance(alice, bob)
        await truffleAssert.passes(
            dai.transferFrom(alice, bob, allowanceAmount, {from: bob})  // bobがaliceの500dai動かす
        );
    });
});