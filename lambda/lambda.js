// @flow
import fs from 'fs';
import handleUsers from './handlers/users';
import { HTTP_METHOD } from './types/enums';
import type { HttpMethod } from './types/types';

type Event = {
  body: string,
  resource: string,
  requestContext: {
    httpMethod: HttpMethod
  },
  pathParameters: Object,
  httpMethod: HttpMethod,
  queryStringParameters: Object
};

export default function handler(event: Event, context: Object, callback: Function): [Object] | Object | string {
  const tmp: HttpMethod = HTTP_METHOD.PUT;
  switch (event.resource) {
    case '/chats':
    case '/chats/{chatId}':
    case '/users':
      return handleUsers(event.httpMethod, event.body);
    default:
      // TODO: clean up errors in class
      return {
        error: ''
      };
  }
}
