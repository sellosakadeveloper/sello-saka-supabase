type UploadFileToConvexArgs = {
  file: File;
  generateUploadUrl: () => Promise<string>;
  getStorageUrl: (args: { storageId: string }) => Promise<string | null>;
};

export async function uploadFileToConvex({
  file,
  generateUploadUrl,
  getStorageUrl,
}: UploadFileToConvexArgs): Promise<{ storageId: string; url: string }> {
  const uploadUrl = await generateUploadUrl();
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file to Convex storage");
  }

  const payload = (await response.json()) as { storageId?: string };
  if (!payload.storageId) {
    throw new Error("Convex storage did not return a file identifier");
  }

  const url = await getStorageUrl({ storageId: payload.storageId });
  if (!url) {
    throw new Error("Failed to resolve Convex storage URL");
  }

  return { storageId: payload.storageId, url };
}
