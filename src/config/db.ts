import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import logger from "../utils/logger"; // Assuming you have a logger module

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "eu-central-1", // Default to Frankfurt region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'your-access-key-id',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'your-secret-access-key',
  }
});

const dynamoDb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
  },
});

const connectDB = async () => {
  try {
    await client.config.credentials();
    logger.info("DynamoDB connection established");
  } catch (error) {
    logger.error(`DynamoDB connection error: ${error}`);
    process.exit(1);
  }
};

export { dynamoDb, connectDB };
