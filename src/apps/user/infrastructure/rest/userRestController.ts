import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { UserFacade } from '../../domain/UserFacade';
import { injectable, inject } from 'tsyringe';

@injectable()
export class UserRestController {
  constructor(@inject("UserFacade") private readonly userFacade: UserFacade) {}

  generatePassword = asyncHandler(async (req: Request, res: Response) => {
    const { length } = req.query;
    let parsedLength = Number(length) || 8;
    if (parsedLength < 6) {
      parsedLength = 6;
    }
    const password = this.userFacade.generatePassword(parsedLength);
    res.json({ password });
  });

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, fullName, password } = req.body;
    const userDto = await this.userFacade.createUser(username, email, fullName, password);
    res.status(201).json({ userDto });
  });

  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const userDtos = await this.userFacade.getAllUsers();
    res.status(200).json({ userDtos });
  });
}
