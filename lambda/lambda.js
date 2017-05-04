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

type OutputEvent = {
  statusCode: number,
  headers: Object,
  body: string
};

function wrapResponse(body: any): OutputEvent {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}

function handler(event: Event, context: Object, callback: Function): void {
  let result;

  switch (event.resource) {
    case '/chats':
      result = {};
      break;
    case '/chats/{chatId}':
      result = {};
      break;
    case '/users':
      result = handleUsers(event.httpMethod, event.body);
      break;
    default:
      // TODO: clean up errors in class
      result = {
        error: ''
      };
  }
  // console.log({
  //   method: event.httpMethod,
  //   resource: event.resource,
  //   result
  // });

  callback(null, wrapResponse(result));
}

exports.handler = handler;
