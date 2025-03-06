import fs from "fs/promises";

export const removeFile = async (filePath: string, silent = true) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (!silent) {
      throw error;
    }
  }
};
