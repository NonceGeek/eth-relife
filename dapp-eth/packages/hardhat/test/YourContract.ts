import { expect } from "chai";
import { ethers } from "hardhat";
import { Relife } from "../typechain-types";

describe("Relife", function () {
  // We define a fixture to reuse the same setup in every test.

  let Relife: Relife;
  before(async () => {
    const [owner] = await ethers.getSigners();
    const RelifeFactory = await ethers.getContractFactory("Relife");
    Relife = (await RelifeFactory.deploy(owner.address)) as Relife;
    await Relife.deployed();
  });

  describe("Deployment", function () {
    it("Should have the right message on deploy", async function () {
      expect(await Relife.greeting()).to.equal("Building Unstoppable Apps!!!");
    });

    it("Should allow setting a new message", async function () {
      const newGreeting = "Learn Scaffold-ETH 2! :)";

      await Relife.setGreeting(newGreeting);
      expect(await Relife.greeting()).to.equal(newGreeting);
    });
  });
});
