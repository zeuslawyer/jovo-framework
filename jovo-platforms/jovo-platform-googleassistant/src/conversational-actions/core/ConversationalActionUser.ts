import { JovoError, User } from 'jovo-core';
import { ConversationalAction } from './ConversationalAction';
import { ConversationalActionRequest } from './ConversationalActionRequest';
import uuidv4 = require('uuid/v4');

export interface UserProfile {
  displayName: string;
  givenName: string;
  familyName: string;
}

export interface GoogleAccountProfile {
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;

  [key: string]: string | boolean;
}

export class ConversationalActionUser extends User {
  conversationalAction: ConversationalAction;

  $params: any = {}; // tslint:disable-line

  constructor(conversationalAction: ConversationalAction) {
    super(conversationalAction);
    this.conversationalAction = conversationalAction;

    this.$params = {
      ...(conversationalAction.$request as ConversationalActionRequest).user!.params
    }

    if (!this.$params.userId) {
      this.$params.userId =  uuidv4();
    } else {
      this.new = false;
    }
  }

  /**
   * Returns user id
   * @returns {string | undefined}
   */
  getId(): string | undefined {
    return this.$params.userId;
  }
}
