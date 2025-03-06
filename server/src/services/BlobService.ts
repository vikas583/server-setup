import { Service } from "typedi";
import axios from 'axios';
import { z } from 'zod';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { APIError } from "../utils/APIError";
import { RESPONSE_STATUS } from "../utils/ResponseStatus";
// import { APIError } from "../utils/APIError";

@Service()
export default class BlobService {
    private client = axios.create({
        baseURL: process.env.BLOB_SERVICE_URL,
        headers: {
            "X-API-KEY": process.env.BLOB_SERVICE_API_KEY,
        },
    });

    async upload(filepath: string, source: string, generateSAS?: boolean) {
        try {

            const readSteam = fs.createReadStream(filepath)
            const data = new FormData();
            data.append('file', readSteam);
            data.append('source', source);
            if (generateSAS) {
                data.append('generateSAS', "1");
            }

            const response = await this.client.post<string>('/upload', data, {
                headers: { ...data.getHeaders() },
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
            });
            const schema = z.string().url();
            const url = schema.parse(response.data);
            return url;
        } catch (err: any) {

            let errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            let errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR;

            if (err instanceof APIError) {
                errorMessage = err.msg;
                errorCode = err.httpCode;
            }
            throw new APIError(errorMessage, errorCode);
        }
    }

    async delete(filepath: string, source: string, silent = true) {

        try {
            const filename = path.basename(filepath);
            const response = await this.client.delete('/delete', {
                data: {
                    filename,
                    source,
                },
            });
            const schema = z.boolean();
            const success = schema.parse(response.data);
            return success;

        } catch (err: any) {
            console.log(err)
            let errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            let errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR;

            if (err instanceof APIError) {
                errorMessage = err.msg;
                errorCode = err.httpCode;
            }
            if (!silent) {
                throw new APIError(errorMessage, errorCode);
            }
        }
    }

    async generateSASURL(blobPath: string) {

        try {
            const response = await this.client.get('/generate-sas-url?blobPath=' + blobPath)

            const schema = z.string().url();
            const url = schema.parse(response.data);
            return url;

        } catch (err: any) {

            let errorMessage = (err as APIError).msg || 'Something went wrong, try again later!';
            let errorCode = (err as APIError).httpCode || RESPONSE_STATUS.INTERNAL_SERVER_ERROR;

            if (err instanceof APIError) {
                errorMessage = err.msg;
                errorCode = err.httpCode;
            }
            throw new APIError(errorMessage, errorCode);
        }
    }
}