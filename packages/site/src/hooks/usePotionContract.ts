/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { useToast } from "./use-toast";
import { ethers } from "ethers";
import { decodeEventLog } from "viem";
import contractData from "@/config/Potion.json";
import {
  encryptValue,
  requestUserDecryption,
  fetchPublicDecryption,
} from "@/lib/fhe";
import { useAccount, useWalletClient, usePublicClient } from "wagmi";

interface ContractType {
  address: string;
  abi: any[];
}
const contract: ContractType = contractData as any;

export const contractConfig = {
  address: contract.address as `0x${string}`,
  abi: contract.abi,
};

export function usePotionContract() {
  const { address } = useAccount();
  const { toast } = useToast();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [isLoading, setIsLoading] = useState(false);

  // TODO: UPDATE ME
  const fetchLeaderboard = useCallback(async () => {
    return [
      { player: "0x1234567890123456789012345678901234567890", guess: 150 },
      { player: "0xabcdef0123456789abcdef0123456789abcdef01", guess: 120 },
      { player: "0x9876543210987654321098765432109876543210", guess: 90 },
    ];
  }, [publicClient, toast]);

  // TODO: Step 3 & 4 - Implement Transaction Submission with FHE
  const submitPotion = useCallback(
    async (vaultCode: number[]) => {
      if (!address || !walletClient || !publicClient) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet to submit.",
          variant: "destructive",
        });
        throw new Error("Wallet not connected");
      }

      // TODO: Implement full potion submission flow
      // This is the most complex function - take it step by step!

      // Mock response for development (remove when implementing)
      toast({
        title: "🧪 Mock Brewing",
        description: "This is a mock response. Implement the real flow!",
      });

      // Simulate a random score
      const mockScore = Math.floor(Math.random() * 200) + 50;
      return {
        decrypted: mockScore.toString(),
        isHighest: Math.random() > 0.7,
      };
    },
    [address, walletClient, publicClient, toast]
  );

  return {
    isLoading,
    fetchLeaderboard,
    submitPotion,
  };
}
