import 'reflect-metadata';
import { container } from 'tsyringe';
import { UserFacade } from './apps/user/domain/UserFacade';
import { UserFacadeImpl } from './apps/user/domain/UserFacadeImpl';
import { EventFacade } from './apps/event/domain/EventFacade';
import { EventFacadeImpl } from './apps/event/domain/EventFacadeImpl';

container.registerSingleton<UserFacade>('UserFacade', UserFacadeImpl);
container.registerSingleton<EventFacade>('EventFacade', EventFacadeImpl);

export { container };
