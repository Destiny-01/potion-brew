import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { Potion, Potion__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("Potion")) as Potion__factory;
  const contract = (await factory.deploy()) as Potion;
  const contractAddress = await contract.getAddress();
  return { contract, contractAddress };
}

describe("Potion", function () {
  let signers: Signers;
  let contract: Potion;
  let contractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
      charlie: ethSigners[3],
    };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ contract, contractAddress } = await deployFixture());
  });

  // Helper: encrypt a set of values for a given player
  async function encryptInputs(player: HardhatEthersSigner, values: number[]) {
    const input = fhevm.createEncryptedInput(contractAddress, player.address);
    values.forEach((v) => input.add8(v));
    return input.encrypt();
  }

  it("should store first guess as highest", async function () {
    const encrypted = await encryptInputs(signers.alice, [5, 6, 7, 8, 9]);
    const tx = await contract
      .connect(signers.alice)
      .compute(
        encrypted.handles[0],
        encrypted.handles[1],
        encrypted.handles[2],
        encrypted.handles[3],
        encrypted.handles[4],
        encrypted.inputProof
      );
    const receipt = await tx.wait();

    // Parse ComputeResult event
    const parsed = receipt?.logs
      .map((log) => {
        try {
          return contract.interface.parseLog({ topics: log.topics, data: log.data });
        } catch {
          return null;
        }
      })
      .find((evt) => evt && evt.name === "ComputeResult");

    if (!parsed) throw new Error("ComputeResult event not found");

    const resultHandle = (parsed as any).args.value;
    const aliceGuess = await fhevm.userDecryptEuint(
      FhevmType.euint16,
      resultHandle,
      contractAddress,
      signers.alice
    );

    expect(aliceGuess).to.be.gte(300).and.to.be.lte(1000);
  });

  it("should not update highest if new result is lower", async function () {
    // First: submit a high input
    let encrypted = await encryptInputs(signers.alice, [10, 10, 10, 10, 10]);
    await contract.connect(signers.alice).compute(
      encrypted.handles[0],
      encrypted.handles[1],
      encrypted.handles[2],
      encrypted.handles[3],
      encrypted.handles[4],
      encrypted.inputProof
    );

    const { 1: guessesBefore } = await contract.getAllHighestGuesses();
    const before = await fhevm.publicDecryptEuint(FhevmType.euint16, guessesBefore[0]);

    // Then: submit lower inputs
    encrypted = await encryptInputs(signers.alice, [1, 1, 1, 1, 1]);
    const tx = await contract.connect(signers.alice).compute(
      encrypted.handles[0],
      encrypted.handles[1],
      encrypted.handles[2],
      encrypted.handles[3],
      encrypted.handles[4],
      encrypted.inputProof
    );
    const receipt = await tx.wait();

    const parsed = receipt?.logs
      .map((log) => {
        try {
          return contract.interface.parseLog({ topics: log.topics, data: log.data });
        } catch {
          return null;
        }
      })
      .find((evt) => evt && evt.name === "ComputeResult");

    if (!parsed) throw new Error("ComputeResult event not found");

    const resultHandle = (parsed as any).args.value;
    const after = await fhevm.userDecryptEuint(
      FhevmType.euint16,
      resultHandle,
      contractAddress,
      signers.alice
    );

    // The second attempt result is smaller
    expect(after).to.lt(before);
  });

  it("should keep highest guesses separately for different players", async function () {
    // Alice plays
    let encryptedAlice = await encryptInputs(signers.alice, [3, 3, 3, 3, 3]);
    await contract.connect(signers.alice).compute(
      encryptedAlice.handles[0],
      encryptedAlice.handles[1],
      encryptedAlice.handles[2],
      encryptedAlice.handles[3],
      encryptedAlice.handles[4],
      encryptedAlice.inputProof
    );

    // Bob plays
    let encryptedBob = await encryptInputs(signers.bob, [9, 9, 9, 9, 9]);
    await contract.connect(signers.bob).compute(
      encryptedBob.handles[0],
      encryptedBob.handles[1],
      encryptedBob.handles[2],
      encryptedBob.handles[3],
      encryptedBob.handles[4],
      encryptedBob.inputProof
    );

    // Retrieve leaderboard
    const { 0: players, 1: guesses } = await contract.getAllHighestGuesses();
    expect(players.length).to.eq(2);

    const aliceGuess = await fhevm.publicDecryptEuint(FhevmType.euint16, guesses[0]);
    const bobGuess = await fhevm.publicDecryptEuint(FhevmType.euint16, guesses[1]);

    expect(aliceGuess).to.be.gte(300);
    expect(bobGuess).to.be.gte(300);
  });
});
