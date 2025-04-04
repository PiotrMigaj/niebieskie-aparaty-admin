import { PutCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from '../../config/db';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'Files';

export interface FileDto {
  fileId: string;
  createdAt: Date;
  description: string;
  eventId: string;
  username: string;
  objectKey: string | null;
  dateOfLastDownload: Date | null;
}

export class File {
  private fileId: string;
  private createdAt: Date;
  private dateOfLastDownload: Date | null;

  constructor(
    private description: string,
    private eventId: string,
    private username: string,
    private objectKey: string | null = null,
  ) {
    this.fileId = uuidv4();
    this.createdAt = new Date();
    this.dateOfLastDownload = null; // Default value is null
  }

  async save(): Promise<File> {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        fileId: this.fileId,
        createdAt: this.createdAt.toISOString(),
        description: this.description,
        eventId: this.eventId,
        username: this.username,
        objectKey: this.objectKey,
        dateOfLastDownload: this.dateOfLastDownload ? this.dateOfLastDownload.toISOString() : null,
      },
    });
    await dynamoDb.send(command);
    return this;
  }

  static async findByUsername(username: string): Promise<File[]> {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'username = :username', // Filter by username
      ExpressionAttributeValues: {
        ':username': username,
      },
    });
    const { Items } = await dynamoDb.send(command);
    return (Items ?? []).map((item) => {
      const file = new File(item.description, item.eventId, item.username, item.objectKey);
      file.fileId = item.fileId;
      file.createdAt = new Date(item.createdAt);
      file.dateOfLastDownload = item.dateOfLastDownload ? new Date(item.dateOfLastDownload) : null;
      return file;
    });
  }

  toResponse(): FileDto {
    return {
      fileId: this.fileId,
      createdAt: this.createdAt,
      description: this.description,
      eventId: this.eventId,
      username: this.username,
      objectKey: this.objectKey,
      dateOfLastDownload: this.dateOfLastDownload,
    };
  }

  getEventId(): string {
    return this.eventId;
  }
}
