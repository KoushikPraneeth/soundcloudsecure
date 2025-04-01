import { Dropbox } from "dropbox";
import { useAuthStore } from "../store/authStore";
import { usePlayerStore } from "../store/playerStore";
import { DropboxError } from "../types";
import type { Track, DropboxAuthResponse } from "../types";

const DROPBOX_APP_KEY = import.meta.env.VITE_DROPBOX_APP_KEY || "";
const DROPBOX_APP_SECRET = import.meta.env.VITE_DROPBOX_APP_SECRET || "";
const REDIRECT_URI = window.location.origin + "/auth/dropbox/callback";
const PAGE_SIZE = 20;

export const getAuthUrl = async (): Promise<string> => {
  return `https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_APP_KEY}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=code`;
};

export const handleAuthCallback = async (code: string): Promise<void> => {
  try {
    useAuthStore.getState().setAuth({ isAuthenticating: true });
    const params = new URLSearchParams({
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    });

    const authString = btoa(`${DROPBOX_APP_KEY}:${DROPBOX_APP_SECRET}`);

    const response = await fetch("https://api.dropbox.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authString}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Token exchange failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      const errorCode = errorData.error || "unknown_error";
      const errorDesc = errorData.error_description || response.statusText;
      throw new DropboxError(
        `Failed to exchange authorization code: ${errorDesc}`,
        errorCode,
        errorDesc
      );
    }

    const data: DropboxAuthResponse = await response.json();
    const expiresAt = Date.now() + data.expires_in * 1000;

    useAuthStore.getState().setAuth({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt,
      isAuthenticated: true,
      isAuthenticating: false,
      error: null,
    });
  } catch (error) {
    console.error("Auth callback error:", error);
    useAuthStore.getState().setAuth({
      error: error instanceof Error ? error.message : "Authentication failed",
      isAuthenticating: false,
    });
  }
};

export const refreshAccessToken = async (): Promise<void> => {
  const { refreshToken } = useAuthStore.getState();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    useAuthStore.getState().setAuth({ isAuthenticating: true });
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const authString = btoa(`${DROPBOX_APP_KEY}:${DROPBOX_APP_SECRET}`);

    const response = await fetch("https://api.dropbox.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${authString}`,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Token refresh failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new DropboxError(
        "Failed to refresh token",
        errorData.error || "unknown_error",
        errorData.error_description || response.statusText
      );
    }

    const data: DropboxAuthResponse = await response.json();
    const expiresAt = Date.now() + data.expires_in * 1000;

    useAuthStore.getState().setAuth({
      accessToken: data.access_token,
      expiresAt,
      isAuthenticating: false,
      error: null,
    });
  } catch (error) {
    useAuthStore.getState().setAuth({
      error: error instanceof Error ? error.message : "Token refresh failed",
      isAuthenticating: false,
    });
  }
};

export const createDropboxClient = (): Dropbox | null => {
  const { accessToken, expiresAt } = useAuthStore.getState();

  if (!accessToken || !expiresAt) {
    console.log(
      "Cannot create Dropbox client: Missing access token or expiry time"
    );
    return null;
  }

  const timeUntilExpiry = expiresAt - Date.now();
  console.log(
    "Access token expires in:",
    Math.round(timeUntilExpiry / 1000),
    "seconds"
  );

  if (timeUntilExpiry < 300000) {
    console.log("Access token expiring soon. Attempting refresh...");
    refreshAccessToken();
  }

  console.log("Creating Dropbox client with valid access token");
  return new Dropbox({ accessToken });
};

const processFiles = async (
  client: Dropbox,
  entries: Array<{ ".tag": string; path_display?: string; name: string }>,
  setPagination: boolean = true
): Promise<Track[]> => {
  const tracks: Track[] = [];
  const failures: Array<{ name: string; error: string }> = [];

  for (const entry of entries) {
    if (entry[".tag"] !== "file") {
      console.log(
        "Skipping non-file entry:",
        entry[".tag"],
        entry.path_display
      );
      continue;
    }

    const path = entry.path_display;
    const name = entry.name;

    if (!path || !name) {
      console.log("Skipping entry with missing path or name:", { path, name });
      continue;
    }

    const isMusicFile = /\.(mp3|m4a|wav|ogg|flac|opus)$/i.test(path);

    if (!isMusicFile) {
      console.log("Skipping non-music file:", path);
      continue;
    }

    console.log("Processing music file:", { name, path });

    try {
      console.log("Getting temporary link for:", path);
      const linkResponse = await client.filesGetTemporaryLink({
        path,
      });
      console.log("Got temporary link");

      tracks.push({
        id: path,
        name,
        path,
        temporaryLink: linkResponse.result.link,
        encryptedKey: "",
        iv: "",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`Failed to get temporary link for ${entry.name}:`, error);
      failures.push({ name: entry.name, error: errorMessage });
    }
  }

  if (failures.length > 0) {
    console.error("Failed to process some files:", failures);
    if (tracks.length === 0 && failures.length > 0) {
      throw new Error(
        `Failed to process any files. Errors: ${failures
          .map((f) => `${f.name} (${f.error})`)
          .join(", ")}`
      );
    }
  }

  return tracks;
};

export const fetchFiles = async (
  client: Dropbox,
  cursor?: string
): Promise<Track[]> => {
  try {
    const playerStore = usePlayerStore.getState();

    if (cursor) {
      console.log("Fetching more files using cursor:", cursor);
      const response = await client.filesListFolderContinue({ cursor });
      const tracks = await processFiles(client, response.result.entries);

      playerStore.setHasMore(response.result.has_more);
      if (response.result.has_more) {
        playerStore.setCursor(response.result.cursor);
      }

      return tracks;
    }

    console.log("Fetching initial files from Dropbox root directory...");
    const response = await client.filesListFolder({
      path: "",
      limit: PAGE_SIZE,
      include_media_info: true,
    });

    console.log("Files found:", response.result.entries.length);
    const tracks = await processFiles(client, response.result.entries);

    playerStore.setHasMore(response.result.has_more);
    if (response.result.has_more) {
      playerStore.setCursor(response.result.cursor);
    }

    return tracks;
  } catch (error) {
    console.error("Error fetching files:", error);
    if (error instanceof Error) {
      if (error.message.includes("path/not_found")) {
        throw new DropboxError(
          "Could not find the specified path in your Dropbox",
          "path/not_found"
        );
      } else if (error.message.includes("invalid_access_token")) {
        throw new DropboxError(
          "Your Dropbox session has expired",
          "invalid_access_token"
        );
      }
    }
    throw error;
  }
};

export const uploadFile = async (file: File, onProgress?: (progress: number) => void): Promise<Track | null> => {
  const client = createDropboxClient();
  if (!client) {
    throw new Error('Not authenticated with Dropbox');
  }

  try {
    // Report start of file reading
    onProgress?.(10);
    
    // Read the file as an ArrayBuffer
    const fileBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      
      // Add progress event for file reading
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          // Calculate progress percentage (10-50%)
          const fileReadProgress = 10 + (event.loaded / event.total) * 40;
          onProgress?.(Math.round(fileReadProgress));
        }
      };
      
      reader.readAsArrayBuffer(file);
    });

    // Report start of upload
    onProgress?.(50);
    
    // Upload the file to Dropbox
    const response = await client.filesUpload({
      path: `/${file.name}`,
      contents: fileBuffer,
      mode: { '.tag': 'overwrite' },
      autorename: true,
    });

    // Report completion of upload
    onProgress?.(80);
    
    // Process the uploaded file to get track information
    const track = await processFiles(client, [response], false);
    
    // Report completion of metadata processing
    onProgress?.(100);
    
    return track[0] || null;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const revokeAccess = async (): Promise<void> => {
  const { accessToken } = useAuthStore.getState();

  if (!accessToken) {
    return;
  }

  try {
    const response = await fetch(
      "https://api.dropboxapi.com/2/auth/token/revoke",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Token revocation failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      let errorCode = "unknown_error";
      if (
        typeof errorData.error === "object" &&
        errorData.error !== null &&
        ".tag" in errorData.error
      ) {
        errorCode = errorData.error[".tag"];
      } else if (typeof errorData.error === "string") {
        errorCode = errorData.error;
      }

      switch (errorCode) {
        case "invalid_access_token":
          throw new DropboxError(
            "Token already expired or invalid",
            "invalid_access_token"
          );
        case "expired_access_token":
          throw new DropboxError(
            "Token has already expired",
            "expired_access_token"
          );
        default:
          throw new DropboxError(
            "Failed to revoke access",
            errorCode,
            errorData.error_description || response.statusText
          );
      }
    }

    useAuthStore.getState().clearAuth();
    console.log("Successfully revoked Dropbox access");
  } catch (error) {
    console.error("Error revoking access:", error);
    useAuthStore.getState().setAuth({
      error: error instanceof Error ? error.message : "Failed to revoke access",
    });
    useAuthStore.getState().clearAuth();
  }
};
