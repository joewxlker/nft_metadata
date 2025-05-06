import { Request, Response, Router } from "express";
import { ContractData } from "../../types/contract";
import { NFT_ABI, NFT_ADDRESS, NFT_CHAIN } from "../../services/nftService";

const router = Router();

const getContract = async (_req: Request, res: Response) => {
    const data: ContractData = {
        abi: NFT_ABI,
        address: NFT_ADDRESS,
        chain: NFT_CHAIN
    }

    res.json(data)
}

router.get("/", getContract);

export default router;