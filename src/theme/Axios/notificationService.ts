import { Subject } from 'rxjs';

const notificationSubject = new Subject<{ message: string }>();

export const notificationService = {
  onNotify: () => notificationSubject.asObservable(),
  notify: (message: string) => notificationSubject.next({ message }),
};
