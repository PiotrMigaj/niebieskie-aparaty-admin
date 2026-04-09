import {
  PutCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from '../../../config/db';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'Events';

export interface EventDto {
  eventId: string;
  createdAt: Date;
  date: string;
  description: string;
  title: string;
  username: string;
  imagePlaceholderObjectKey: string | null;
  galleryId: string | null;
  selectionAvailable?: boolean;
  camelGallery?: boolean;
  tokenId?: string;
  tokenIdCreatedAt?: string;
  tokenIdValidDays?: string;
}

export class Event {
  private eventId: string;
  private createdAt: Date;
  private galleryId: string | null;

  constructor(
    private date: string,
    private description: string,
    private title: string,
    private username: string,
    private imagePlaceholderObjectKey: string | null = null,
    galleryId: string | null = null,
    private selectionAvailable?: boolean,
    private camelGallery?: boolean,
    private tokenId?: string,
    private tokenIdCreatedAt?: string,
    private tokenIdValidDays?: string,
  ) {
    this.eventId = uuidv4();
    this.createdAt = new Date();
    this.galleryId = galleryId;
  }

  async save(): Promise<Event> {
    const item: any = {
      eventId: this.eventId,
      createdAt: this.createdAt.toISOString(),
      date: this.date,
      description: this.description,
      title: this.title,
      username: this.username,
      imagePlaceholderObjectKey: this.imagePlaceholderObjectKey,
      galleryId: this.galleryId,
    };

    // Only include selectionAvailable if it's defined
    if (this.selectionAvailable !== undefined) {
      item.selectionAvailable = this.selectionAvailable;
    }
    if (this.camelGallery !== undefined) {
      item.camelGallery = this.camelGallery;
    }
    if (this.tokenId !== undefined) {
      item.tokenId = this.tokenId;
    }
    if (this.tokenIdCreatedAt !== undefined) {
      item.tokenIdCreatedAt = this.tokenIdCreatedAt;
    }
    if (this.tokenIdValidDays !== undefined) {
      item.tokenIdValidDays = this.tokenIdValidDays;
    }

    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    });
    await dynamoDb.send(command);
    return this;
  }

  static async findByUsername(username: string): Promise<Event[]> {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username,
      },
    });
    const { Items } = await dynamoDb.send(command);
    return (Items ?? []).map((item) => {
      const event = new Event(
        item.date,
        item.description,
        item.title,
        item.username,
        item.imagePlaceholderObjectKey,
        item.galleryId,
        item.selectionAvailable,
        item.camelGallery,
        item.tokenId,
        item.tokenIdCreatedAt,
        item.tokenIdValidDays,
      );
      event.eventId = item.eventId;
      event.createdAt = new Date(item.createdAt);
      return event;
    });
  }

  static async findById(eventId: string): Promise<Event | null> {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        eventId: eventId,
      },
    });
    const { Item } = await dynamoDb.send(command);
    if (!Item) return null;

    const event = new Event(
      Item.date,
      Item.description,
      Item.title,
      Item.username,
      Item.imagePlaceholderObjectKey,
      Item.galleryId,
      Item.selectionAvailable,
      Item.camelGallery,
      Item.tokenId,
      Item.tokenIdCreatedAt,
      Item.tokenIdValidDays,
    );
    event.eventId = Item.eventId;
    event.createdAt = new Date(Item.createdAt);
    return event;
  }

  static async existsById(eventId: string): Promise<boolean> {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        eventId: eventId,
      },
    });
    const { Item } = await dynamoDb.send(command);
    return !!Item;
  }

  static async deleteById(eventId: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        eventId: eventId,
      },
    });
    await dynamoDb.send(command);
  }

  static async updateImagePlaceholderObjectKey(
    eventId: string,
    newKey: string | null,
  ): Promise<void> {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { eventId },
      UpdateExpression: 'SET imagePlaceholderObjectKey = :newKey',
      ExpressionAttributeValues: {
        ':newKey': newKey,
      },
      ConditionExpression: 'attribute_exists(eventId)',
    });

    await dynamoDb.send(command);
  }

  static async updateSelectionAvailable(
    eventId: string,
    selectionAvailable: boolean,
  ): Promise<void> {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { eventId },
      UpdateExpression: 'SET selectionAvailable = :selectionAvailable',
      ExpressionAttributeValues: {
        ':selectionAvailable': selectionAvailable,
      },
      ConditionExpression: 'attribute_exists(eventId)',
    });

    await dynamoDb.send(command);
  }

  static async updateCamelGallery(eventId: string, camelGallery: boolean): Promise<void> {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { eventId },
      UpdateExpression: 'SET camelGallery = :camelGallery',
      ExpressionAttributeValues: {
        ':camelGallery': camelGallery,
      },
      ConditionExpression: 'attribute_exists(eventId)',
    });

    await dynamoDb.send(command);
  }

  static async updateToken(
    eventId: string,
    tokenId: string,
    tokenIdCreatedAt: string,
    tokenIdValidDays: string,
  ): Promise<void> {
    const command = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { eventId },
      UpdateExpression:
        'SET tokenId = :tokenId, tokenIdCreatedAt = :tokenIdCreatedAt, tokenIdValidDays = :tokenIdValidDays',
      ExpressionAttributeValues: {
        ':tokenId': tokenId,
        ':tokenIdCreatedAt': tokenIdCreatedAt,
        ':tokenIdValidDays': tokenIdValidDays,
      },
      ConditionExpression: 'attribute_exists(eventId)',
    });

    await dynamoDb.send(command);
  }

  toResponse(): EventDto {
    const response: EventDto = {
      eventId: this.eventId,
      createdAt: this.createdAt,
      date: this.date,
      description: this.description,
      title: this.title,
      username: this.username,
      imagePlaceholderObjectKey: this.imagePlaceholderObjectKey,
      galleryId: this.galleryId,
    };

    // Only include selectionAvailable if it's defined
    if (this.selectionAvailable !== undefined) {
      response.selectionAvailable = this.selectionAvailable;
    }
    if (this.camelGallery !== undefined) {
      response.camelGallery = this.camelGallery;
    }
    if (this.tokenId !== undefined) {
      response.tokenId = this.tokenId;
    }
    if (this.tokenIdCreatedAt !== undefined) {
      response.tokenIdCreatedAt = this.tokenIdCreatedAt;
    }
    if (this.tokenIdValidDays !== undefined) {
      response.tokenIdValidDays = this.tokenIdValidDays;
    }

    return response;
  }

  getEventId(): string {
    return this.eventId;
  }

  getSelectionAvailable(): boolean | undefined {
    return this.selectionAvailable;
  }

  setSelectionAvailable(selectionAvailable: boolean | undefined): void {
    this.selectionAvailable = selectionAvailable;
  }
}
