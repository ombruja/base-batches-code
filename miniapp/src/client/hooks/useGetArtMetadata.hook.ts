"use client";

import { useState, useCallback } from "react";

import { ZodiacApiEnum } from "~/client/types/client.types";

export type ArtMetadata = {
  name: string;
  description: string;
  image: string;
  // Specific trait types from the metadata
  miniApp: string;
  artistFarcasterHandle: string;
  artistFid: number;
  zodiacSign: string;
  zodiacApiEnum: ZodiacApiEnum;
  curation: string;
  season: string;
  // Keep a record of any additional/unknown traits
  additionalTraits: Record<string, string>;
};

export type GetArtMetadataResponse =
  | {
      success: true;
      artMetadata: ArtMetadata;
    }
  | {
      success: false;
      message?: string;
    };

export function useGetArtMetadata() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [artMetadata, setArtMetadata] = useState<ArtMetadata | null>(null);

  const blobBaseUrl = process.env.NEXT_PUBLIC_BLOB_BASE_URL_WESTERN_ZODIAC;
  const metadataLocation =
    process.env.NEXT_PUBLIC_BLOB_BASE_URL_WESTERN_ZODIAC_METADATA_LOCATION;

  const fetchArtMetadata = useCallback(
    async ({
      pieceOnchainId = null,
    }: {
      pieceOnchainId?: string | null;
    }): Promise<GetArtMetadataResponse> => {
      if (!pieceOnchainId) {
        setIsError(true);
        setErrorMessage("Piece onchain ID is required");
        return { success: false, message: "Piece onchain ID is required" };
      }

      const onchainIdWithoutPrefix = pieceOnchainId
        .toLowerCase()
        .replace(/^0x/, "");

      const metadataPathname = `${metadataLocation}/${onchainIdWithoutPrefix}.json`;
      const fullMetadataPathname = `${blobBaseUrl}/${metadataPathname}`;

      setIsLoading(true);
      setIsError(false);
      setErrorMessage(undefined);

      try {
        const response = await fetch(fullMetadataPathname);

        if (!response.ok) {
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }

        const data = await response.json();

        // Initialize metadata with default values
        const processedMetadata: ArtMetadata = {
          name: data.name || "",
          description: data.description || "",
          image: data.image || "",
          miniApp: "",
          artistFarcasterHandle: "",
          artistFid: 0,
          zodiacSign: "",
          zodiacApiEnum: ZodiacApiEnum.ARIES,
          curation: "",
          season: "",
          additionalTraits: {},
        };

        // Process attributes into specific fields
        if (Array.isArray(data.attributes)) {
          data.attributes.forEach(
            (attr: { trait_type: string; value: string }) => {
              if (attr.trait_type && attr.value) {
                // Map each trait type to its specific field
                switch (attr.trait_type) {
                  case "Mini App":
                    processedMetadata.miniApp = attr.value;
                    break;
                  case "Artist Handle":
                    processedMetadata.artistFarcasterHandle = attr.value;
                    break;
                  case "Artist FID":
                    processedMetadata.artistFid = parseInt(attr.value);
                    break;
                  case "Zodiac Sign":
                    processedMetadata.zodiacSign = attr.value;
                    // Convert to lowercase for API enum
                    processedMetadata.zodiacApiEnum =
                      attr.value.toLowerCase() as ZodiacApiEnum;
                    break;
                  case "Curation":
                    processedMetadata.curation = attr.value;
                    break;
                  case "Season":
                    processedMetadata.season = attr.value;
                    break;
                  // Store any other traits in the additionalTraits object
                  default:
                    processedMetadata.additionalTraits[attr.trait_type] =
                      attr.value;
                }
              }
            },
          );
        }

        setArtMetadata(processedMetadata);
        setIsLoading(false);

        return {
          success: true,
          artMetadata: processedMetadata,
        };
      } catch (error) {
        setIsError(true);
        setArtMetadata(null);
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";
        setErrorMessage(message);
        setIsLoading(false);

        return {
          success: false,
          message,
        };
      }
    },
    [blobBaseUrl, metadataLocation],
  );

  return {
    isLoading,
    isError,
    errorMessage,
    artMetadata,
    fetchArtMetadata,
  };
}
