// @flow
import uuid from 'uuid';
import { HTTP_METHOD } from '../types/enums';
import type { HttpMethod } from '../types/types';

type UserInfo = {
  name: string
};

function getUsers(): [UserInfo] {
  // TODO: unstub
  return [
    {
      name: 'enwrought'
    }
  ];
}

function createUser(newUser: UserInfo): string {
  // TODO: unstub
  return uuid.v4();
}

export default function handleUsers(httpMethod: HttpMethod, body: string): [UserInfo] | string {
  switch (httpMethod) {
    case 'GET':
      return getUsers();
    case 'POST':
      const parsedBody: UserInfo = JSON.parse(body);
      return createUser(parsedBody);
    default:
      return '';
  }
}
