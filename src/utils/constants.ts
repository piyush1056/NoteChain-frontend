import { PublicKey, clusterApiUrl } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey(
  "G48CMVhqv9r9qpbg9zbFwWj1LSe9d5jnRRvE6rzfNNZS"
);

export const NETWORK = clusterApiUrl("devnet");


export const USER_PROFILE_SEED = "user_profile";
export const NOTE_SEED = "note";
export const SHARE_SEED = "share";


export const MAX_USERNAME_LENGTH = 50;
export const MAX_TITLE_LENGTH = 100;
export const MAX_CONTENT_LENGTH = 500;
