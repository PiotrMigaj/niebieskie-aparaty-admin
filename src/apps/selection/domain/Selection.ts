import {
  PutCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from '../../../config/db';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'Selection';

export interface SelectionDto {
  selectionId: string;
  blocked: boolean;
  createdAt: Date;
  eventId: string;
  eventTitle: string;
  maxNumberOfPhotos: number;
  selectedImages: string[];
  selectedNumberOfPhotos: number;
  updatedAt: Date;
  username: string;
}

export class Selection {
  private selectionId: string;
  private blocked: boolean;
  private createdAt: Date;
  private selectedImages: string[];
  private selectedNumberOfPhotos: number;
  private updatedAt: Date;

  constructor(
    private eventId: string,
    private eventTitle: string,
    private maxNumberOfPhotos: number,
    private username: string,
  ) {
    this.selectionId = uuidv4();
    this.blocked = false;
    this.createdAt = new Date();
    this.selectedImages = [];
    this.selectedNumberOfPhotos = 0;
    this.updatedAt = new Date();
  }

  async save(): Promise<Selection> {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        selectionId: this.selectionId,
        blocked: this.blocked,
        createdAt: this.createdAt.toISOString(),
        eventId: this.eventId,
        eventTitle: this.eventTitle,
        maxNumberOfPhotos: this.maxNumberOfPhotos,
        selectedImages: this.selectedImages,
        selectedNumberOfPhotos: this.selectedNumberOfPhotos,
        updatedAt: this.updatedAt.toISOString(),
        username: this.username,
      },
    });
    await dynamoDb.send(command);
    return this;
  }

  static async findByEventId(eventId: string): Promise<Selection | null> {
    try {
      const command = new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'eventId = :eventId',
        ExpressionAttributeValues: {
          ':eventId': eventId,
        },
      });
      const { Items } = await dynamoDb.send(command);
      
      if (!Items || Items.length === 0) return null;
      
      const item = Items[0]; // Assuming one selection per event
      const selection = new Selection(
        item.eventId,
        item.eventTitle,
        item.maxNumberOfPhotos,
        item.username,
      );
      selection.selectionId = item.selectionId;
      selection.blocked = item.blocked;
      selection.createdAt = new Date(item.createdAt);
      selection.selectedImages = item.selectedImages || [];
      selection.selectedNumberOfPhotos = item.selectedNumberOfPhotos || 0;
      selection.updatedAt = new Date(item.updatedAt);
      return selection;
    } catch (error: any) {
      // If table doesn't exist, return null (no selection found)
      if (error.name === 'ResourceNotFoundException' || error.__type === 'com.amazonaws.dynamodb.v20120810#ResourceNotFoundException') {
        return null;
      }
      throw error;
    }
  }

  static async findByUsername(username: string): Promise<Selection[]> {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username,
      },
    });
    const { Items } = await dynamoDb.send(command);
    return (Items ?? []).map((item) => {
      const selection = new Selection(
        item.eventId,
        item.eventTitle,
        item.maxNumberOfPhotos,
        item.username,
      );
      selection.selectionId = item.selectionId;
      selection.blocked = item.blocked;
      selection.createdAt = new Date(item.createdAt);
      selection.selectedImages = item.selectedImages || [];
      selection.selectedNumberOfPhotos = item.selectedNumberOfPhotos || 0;
      selection.updatedAt = new Date(item.updatedAt);
      return selection;
    });
  }

  static async findById(selectionId: string): Promise<Selection | null> {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        selectionId: selectionId,
      },
    });
    const { Item } = await dynamoDb.send(command);
    if (!Item) return null;

    const selection = new Selection(
      Item.eventId,
      Item.eventTitle,
      Item.maxNumberOfPhotos,
      Item.username,
    );
    selection.selectionId = Item.selectionId;
    selection.blocked = Item.blocked;
    selection.createdAt = new Date(Item.createdAt);
    selection.selectedImages = Item.selectedImages || [];
    selection.selectedNumberOfPhotos = Item.selectedNumberOfPhotos || 0;
    selection.updatedAt = new Date(Item.updatedAt);
    return selection;
  }

  static async existsByEventId(eventId: string): Promise<boolean> {
    try {
      const command = new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'eventId = :eventId',
        ExpressionAttributeValues: {
          ':eventId': eventId,
        },
      });
      const { Items } = await dynamoDb.send(command);
      return !!(Items && Items.length > 0);
    } catch (error: any) {
      // If table doesn't exist, return false (no selection exists)
      if (error.name === 'ResourceNotFoundException' || error.__type === 'com.amazonaws.dynamodb.v20120810#ResourceNotFoundException') {
        return false;
      }
      throw error;
    }
  }

  static async deleteById(selectionId: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        selectionId: selectionId,
      },
    });
    await dynamoDb.send(command);
  }

  static async updateSelectedImages(
    selectionId: string,
    selectedImages: string[],
  ): Promise<void> {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { selectionId },
      UpdateExpression: 'SET selectedImages = :selectedImages, selectedNumberOfPhotos = :selectedNumberOfPhotos, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':selectedImages': selectedImages,
        ':selectedNumberOfPhotos': selectedImages.length,
        ':updatedAt': new Date().toISOString(),
      },
      ConditionExpression: 'attribute_exists(selectionId)',
    });

    await dynamoDb.send(command);
  }

  static async updateBlocked(
    selectionId: string,
    blocked: boolean,
  ): Promise<void> {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { selectionId },
      UpdateExpression: 'SET blocked = :blocked, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':blocked': blocked,
        ':updatedAt': new Date().toISOString(),
      },
      ConditionExpression: 'attribute_exists(selectionId)',
    });

    await dynamoDb.send(command);
  }

  toResponse(): SelectionDto {
    return {
      selectionId: this.selectionId,
      blocked: this.blocked,
      createdAt: this.createdAt,
      eventId: this.eventId,
      eventTitle: this.eventTitle,
      maxNumberOfPhotos: this.maxNumberOfPhotos,
      selectedImages: this.selectedImages,
      selectedNumberOfPhotos: this.selectedNumberOfPhotos,
      updatedAt: this.updatedAt,
      username: this.username,
    };
  }

  getSelectionId(): string {
    return this.selectionId;
  }

  getEventId(): string {
    return this.eventId;
  }

  getBlocked(): boolean {
    return this.blocked;
  }

  setBlocked(blocked: boolean): void {
    this.blocked = blocked;
    this.updatedAt = new Date();
  }

  getSelectedImages(): string[] {
    return this.selectedImages;
  }

  setSelectedImages(selectedImages: string[]): void {
    this.selectedImages = selectedImages;
    this.selectedNumberOfPhotos = selectedImages.length;
    this.updatedAt = new Date();
  }
}