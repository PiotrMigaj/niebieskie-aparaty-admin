import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { UserFacade } from '../../domain/UserFacade';
import { injectable, inject } from 'tsyringe';

@injectable()
export class UserController {
  constructor(@inject('UserFacade') private userFacade: UserFacade) {}

  listUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await this.userFacade.getAllUsers();
    res.render('users/list', { users });
  });

  showCreateForm = asyncHandler(async (req: Request, res: Response) => {
    res.render('users/create');
  });

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, fullName, password } = req.body;
    await this.userFacade.createUser(username, email, fullName, password);
    res.redirect('/users');
  });
}
