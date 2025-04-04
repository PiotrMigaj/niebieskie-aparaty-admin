import { PutCommand, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from '../../config/db';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'Events';

export interface EventDto {
  eventId: string;
  createdAt: Date;
  date: string; // ISO date string (YYYY-MM-DD)
  description: string;
  title: string;
  username: string;
  imagePlaceholderObjectKey: string | null;
}

export class Event {
  private eventId: string;
  private createdAt: Date;

  constructor(
    private date: string, // format: YYYY-MM-DD
    private description: string,
    private title: string,
    private username: string,
    private imagePlaceholderObjectKey: string | null = null,
  ) {
    this.eventId = uuidv4();
    this.createdAt = new Date();
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
      },
    });
    await dynamoDb.send(command);
    return this;
  }

  static async findByUsername(username: string): Promise<Event[]> {
    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'username = :username', // Filter by username
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
      );
      event.eventId = item.eventId;
      event.createdAt = new Date(item.createdAt);
      return event;
    });
  }

  static async existsById(eventId: string): Promise<boolean> {
    const command = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        eventId: eventId,
      },
    });
    const { Item } = await dynamoDb.send(command);
    return !!Item; // Returns true if the item exists, false otherwise
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
    };
  }

  getEventId(): string {
    return this.eventId;
  }
}
