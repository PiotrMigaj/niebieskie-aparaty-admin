import 'reflect-metadata';
import { container } from 'tsyringe';
import { UserFacade } from './apps/user/domain/UserFacade';
import { UserFacadeImpl } from './apps/user/domain/UserFacadeImpl';

container.registerSingleton<UserFacade>('UserFacade', UserFacadeImpl);

export { container };
