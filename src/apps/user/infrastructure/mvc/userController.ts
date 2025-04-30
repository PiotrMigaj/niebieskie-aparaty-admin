import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { UserFacade } from '../../domain/UserFacade';
import { injectable, inject } from 'tsyringe';
import { EventFacade } from '../../../event/domain/EventFacade';

@injectable()
export class UserController {
  constructor(
    @inject('UserFacade') private userFacade: UserFacade,
    @inject('EventFacade') private eventFacade: EventFacade,
  ) {}

  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await this.userFacade.getAllUsers();
    res.render('users/list', { users });
  });

  showCreateForm = asyncHandler(async (req: Request, res: Response) => {
    res.render('users/create', { error: null, formData: {} });
  });

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, fullName, password } = req.body;
    try {
      await this.userFacade.createUser(username, email, fullName, password);
      res.redirect('/users');
    } catch (error: any) {
      res.render('users/create', {
        error: error.message,
        formData: { username, email, fullName },
      });
    }
  });

  getUserDetails = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;
    const user = await this.userFacade.getUserByUsername(username);
    if (!user) {
      res.redirect('/users');
      return;
    }
    const events = await this.eventFacade.getEventsByUsername(username);
    res.render('users/details', { user, events });
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;
    await this.userFacade.deleteUser(username);
    res.redirect('/users');
  });

  showCreateEventForm = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;
    const user = await this.userFacade.getUserByUsername(username);
    if (!user) {
      res.redirect('/users');
      return;
    }
    res.render('users/create-event', { user, error: null });
  });

  createEvent = asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;
    const { date, description, title } = req.body;
    try {
      await this.eventFacade.createEvent(date, description || '', title, username);
      res.redirect(`/users/${username}`);
    } catch (error: any) {
      const user = await this.userFacade.getUserByUsername(username);
      res.render('users/create-event', { user, error: error.message });
    }
  });
}
