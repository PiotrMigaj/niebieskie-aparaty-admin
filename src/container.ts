import 'reflect-metadata';
import { container } from 'tsyringe';
import { UserFacade } from './apps/user/domain/UserFacade';
import { UserFacadeImpl } from './apps/user/domain/UserFacadeImpl';
import { EventFacade } from './apps/event/domain/EventFacade';
import { EventFacadeImpl } from './apps/event/domain/EventFacadeImpl';
import { FileFacade } from './apps/file/domain/FileFacade';
import { FileFacadeImpl } from './apps/file/domain/FileFacadeImpl';

container.registerSingleton<UserFacade>('UserFacade', UserFacadeImpl);
container.registerSingleton<EventFacade>('EventFacade', EventFacadeImpl);
container.registerSingleton<FileFacade>('FileFacade', FileFacadeImpl);

export { container };
