import { Response, Request } from "express";

import uploader from "../utils/uploader";
import response from "../utils/response";
import { IReqUser } from "./auth.middleware";

export default {
  async single(req: Request, res: Response) {
    if (!req.file) {
      return response.error(res, null, "File is not exist");
    }
    try {
      const result = await uploader.uploadSingle(req.file);

      response.success(res, result, "Success upload a file");
    } catch (error) {
      response.error(res, error, "Failed upload a file");
    }
  },
  async multiple(req: Request, res: Response) {
    if (!req.files || req.files.length === 0) {
      return response.error(res, null, "Files are not exist");
    }
    try {
      const result = await uploader.uploadMultiple(
        req.files as Express.Multer.File[]
      );
      response.success(res, result, "Success upload files");
    } catch {
      response.error(res, null, "Failed upload files");
    }
  },
  async remove(req: Request, res: Response) {
    try {
      const { fileUrl } = req.body as { fileUrl: string };
      const result = await uploader.remove(fileUrl);

      response.success(res, result, "Success remove file");
    } catch {
      response.error(res, null, "Failed remove file");
    }
  },
};
