import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";
import { Service } from "typedi";

@Service()
export class KeyVaultService {
    private client: SecretClient;

    constructor() {
        const credential = new DefaultAzureCredential(); // Automatically picks the right authentication method
        this.client = new SecretClient(process.env.KEY_VAULT_URL, credential);
    }

    // Store a secret in Key Vault
    async storeKey(keyName: string, keyValue: string) {
        try {
            await this.client.setSecret(keyName, keyValue);

            return true
        } catch (err) {
            console.error(`Error storing key ${keyName}:`, err);
            throw err;  // Rethrow error to handle at a higher level
        }
    }

    // Retrieve a secret from Key Vault
    public async getKey(keyName: string): Promise<string | undefined> {
        try {
            const result = await this.client.getSecret(keyName);
            return result.value;
        } catch (err) {
            console.error(`Error fetching key ${keyName}:`, err);
            throw err;
        }
    }
}
