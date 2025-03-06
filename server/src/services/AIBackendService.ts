import axios, { AxiosInstance } from "axios";
import { Service } from "typedi";

@Service()
export class AIBackendService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.AI_BACKEND_URL,
    });
  }

  async processDocument(
    shortCode: string,
    projId: number,
    docId: number,
    userId: number
  ) {
    const response = await this.client.post<{
      message: string;
    }>("/process_document", {
      ca_id: shortCode,
      proj_id: projId,
      doc_id: docId,
      user_id: userId,
    });
    return response.data;
  }

  async startPlaybook(
    shortCode: string,
    projId: number,
    userId: number,
    docId: number,
    auditId: number
  ) {
    const response = await this.client.post<{
      message: string;
    }>("/start_playbook", {
      user_id: userId,
      ca_id: shortCode,
      proj_id: projId,
      doc_id: docId,
      audit_id: auditId,
    });
    return response.data;
  }
}
