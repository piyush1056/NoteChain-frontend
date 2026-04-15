import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

    const payload = {
      pinataContent: {
        noteData: content,
        timestamp: new Date().toISOString(),
      },
      pinataMetadata: {
        name: "SolanaNoteApp_Entry.json",
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PINATA_JWT}`, 
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Failed to upload to Pinata IPFS");
    }

    const data = await res.json();
    
    return NextResponse.json({ 
      success: true, 
      ipfsHash: data.IpfsHash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}` 
    });

  } catch (error) {
    console.error("IPFS Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}