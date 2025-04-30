import {
  PutCommand,
  ScanCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from '../../../config/db';
import { v4 as uuidv4 } from 'uuid';
import { createAppError } from '../../../middleware/errorMiddleware';

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
  ) {
    this.eventId = uuidv4();
    this.createdAt = new Date();
    this.galleryId = galleryId;
  }

  async save(): Promise<Event> {
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        eventId: this.eventId,
        createdAt: this.createdAt.toISOString(),
        date: this.date,
        description: this.description,
        title: this.title,
        username: this.username,
        imagePlaceholderObjectKey: this.imagePlaceholderObjectKey,
        galleryId: this.galleryId,
      },
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

  toResponse(): EventDto {
    return {
      eventId: this.eventId,
      createdAt: this.createdAt,
      date: this.date,
      description: this.description,
      title: this.title,
      username: this.username,
      imagePlaceholderObjectKey: this.imagePlaceholderObjectKey,
      galleryId: this.galleryId,
    };
  }

  getEventId(): string {
    return this.eventId;
  }
}
