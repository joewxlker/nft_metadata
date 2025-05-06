import { ethers, Interface } from "ethers";
import { contract, isValidTokenId, NFT_ABI, NFT_ADDRESS, NFT_CHAIN } from "./nftService";
import { breaker } from "./rpcService";

describe("nftAbi", () => {
    it("can be parsed by ethers.Interface", () => {
        expect(() => new Interface(NFT_ABI)).not.toThrow();
    
        const iface = new Interface(NFT_ABI);

        expect(iface.hasFunction("balanceOf")).toBe(true);
        expect(iface.hasFunction("mint")).toBe(true);
        expect(iface.hasFunction("nextTokenId")).toBe(true);
    });
});

describe("nftAddress", () => {
    it("is a valid NFT address", () => {
        expect(ethers.isAddress(NFT_ADDRESS)).toBe(true);
    })
});

describe("nftChain", () => {
    it("is sepolia", () => {
        expect(NFT_CHAIN).toBe("sepolia");
    })
});

describe("isValidTokenId validator logic", () => {
    afterEach(() => jest.restoreAllMocks());
  
    beforeEach(() => {
      jest
        .spyOn(breaker, "call")
        .mockImplementation((fn: () => Promise<unknown>) => fn());
    });
  
    it("returns false for a negative tokenId", async () => {
      jest.spyOn(contract, "nextTokenId").mockResolvedValue(5n);
      await expect(isValidTokenId(-1)).resolves.toBe(false);
    });
  
    it("returns false when tokenId ≥ nextTokenId − 1", async () => {
      jest.spyOn(contract, "nextTokenId").mockResolvedValue(3n);
      // nextTokenId − 1 = 2
      await expect(isValidTokenId(2)).resolves.toBe(false);
      await expect(isValidTokenId(3)).resolves.toBe(false);
    });
  
    it("returns true when tokenId < nextTokenId − 1", async () => {
      jest.spyOn(contract, "nextTokenId").mockResolvedValue(4n);
      // nextTokenId − 1 = 3, so 0,1,2 are valid
      await expect(isValidTokenId(2)).resolves.toBe(true);
    });
  });