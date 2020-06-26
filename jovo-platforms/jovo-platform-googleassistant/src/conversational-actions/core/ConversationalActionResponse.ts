import { JovoResponse, SpeechBuilder, SessionData } from 'jovo-core';
import _get = require('lodash.get');
import { Device, Home, Prompt, Scene, Session, User } from './Interfaces';

export interface ConversationalGoogleActionResponseJSON {
  prompt?: Prompt;
  scene?: Scene;
  session?: Session;
  user?: User;
  home?: Home;
  device?: Device;
  metadata?: any;
  expected?: any;
  logging?: any;
}

/**
 * Thanks to @see http://choly.ca/post/typescript-json/
 */

export class ConversationalActionResponse implements JovoResponse {
  prompt?: Prompt;
  scene?: Scene;
  session?: Session;
  user?: User;
  home?: Home;
  device?: Device;
  metadata?: any;
  expected?: any;
  logging?: any;

  getSessionData(path?: string) {
    return undefined;
  }
  // tslint:disable-next-line
  hasSessionData(name: string, value?: any): boolean {
    return this.hasSessionAttribute(name, value);
  }

  setSessionData(sessionData: SessionData) {
    return this;
  }

  getBasicCard() {
    const items = _get(this, 'richResponse.items');

    for (let i = 0; i < items.length; i++) {
      if (items[i].basicCard) {
        return items[i].basicCard;
      }
    }
  }

  hasImageCard(title?: string, content?: string, imageUrl?: string): boolean {
    const basicCardObject = this.getBasicCard();

    if (!basicCardObject) {
      return false;
    }

    if (!basicCardObject.image) {
      return false;
    }

    if (title) {
      if (title !== basicCardObject.title) {
        return false;
      }
    }

    if (content) {
      if (content !== basicCardObject.formattedText) {
        return false;
      }
    }

    if (imageUrl) {
      if (imageUrl !== basicCardObject.image.url) {
        return false;
      }
    }

    return true;
  }

  hasSimpleCard(title?: string, content?: string): boolean {
    const basicCardObject = this.getBasicCard();

    if (!basicCardObject) {
      return false;
    }

    if (basicCardObject.image) {
      return false;
    }

    if (title) {
      if (title !== basicCardObject.title) {
        return false;
      }
    }

    if (content) {
      if (content !== basicCardObject.formattedText) {
        return false;
      }
    }

    return true;
  }

  getDisplayText() {
    return _get(this, 'richResponse.items[0].simpleResponse.displayText');
  }
  getSuggestionChips() {
    return _get(this, 'richResponse.suggestions');
  }

  hasDisplayText(text?: string): boolean {
    const displayTextString = this.getDisplayText();

    if (!displayTextString) {
      return false;
    }

    if (text) {
      if (text !== displayTextString) {
        return false;
      }
    }

    return true;
  }

  hasSuggestionChips(...chips: string[]): boolean {
    const suggestionChipArray = this.getSuggestionChips();

    if (!suggestionChipArray) {
      return false;
    }
    for (let i = 0; i < chips.length; i++) {
      if (!suggestionChipArray[i] || chips[i] !== suggestionChipArray[i].title) {
        return false;
      }
    }

    return true;
  }

  getMediaResponse() {
    const items = _get(this, 'richResponse.items');

    for (let i = 0; i < items.length; i++) {
      if (items[i].mediaResponse) {
        return items[i].mediaResponse;
      }
    }
  }

  hasMediaResponse(url?: string, name?: string): boolean {
    const mediaResponseObject = this.getMediaResponse();

    if (!mediaResponseObject) {
      return false;
    }

    if (url) {
      if (url !== mediaResponseObject.mediaObjects[0].contentUrl) {
        return false;
      }
    }

    if (name) {
      if (name !== mediaResponseObject.mediaObjects[0].name) {
        return false;
      }
    }

    return true;
  }

  getSpeech() {
    if (!_get(this, 'richResponse.items[0].simpleResponse.ssml')) {
      return;
    }
    return SpeechBuilder.removeSpeakTags(_get(this, 'richResponse.items[0].simpleResponse.ssml'));
  }

  getReprompt() {
    if (!_get(this, 'noInputPrompts[0].ssml')) {
      return;
    }
    return SpeechBuilder.removeSpeakTags(_get(this, 'noInputPrompts[0].ssml'));
  }

  getSpeechPlain() {
    const speech = this.getSpeech();
    if (!speech) {
      return;
    }

    return SpeechBuilder.removeSSML(speech);
  }
  getRepromptPlain() {
    const reprompt = this.getReprompt();
    if (!reprompt) {
      return;
    }

    return SpeechBuilder.removeSSML(reprompt);
  }

  // tslint:disable-next-line
  getSessionAttributes(): any {
    return undefined;
  }

  setSessionAttributes() {
    return this;
  }

  // tslint:disable-next-line
  hasSessionAttribute(name: string, value?: any): any {
    return undefined;
  }

  hasState(): boolean | undefined {
    return undefined;
  }

  hasSessionEnded() {
    return false;
  }

  isTell(speech?: string | string[]) {
    return false;

  }

  isAsk(speech?: string | string[], reprompt?: string | string[]) {
    return true;
  }

  toJSON(): ConversationalGoogleActionResponseJSON {
    // copy all fields from `this` to an empty object and return in
    return Object.assign({}, this);
  }

  // fromJSON is used to convert an serialized version
  // of the User to an instance of the class
  static fromJSON(json: ConversationalGoogleActionResponseJSON | string) {
    if (typeof json === 'string') {
      // if it's a string, parse it first
      return JSON.parse(json, ConversationalActionResponse.reviver);
    } else {
      // create an instance of the User class
      const alexaResponse = Object.create(ConversationalActionResponse.prototype);
      // copy all the fields from the json object
      return Object.assign(alexaResponse, json);
    }
  }

  // reviver can be passed as the second parameter to JSON.parse
  // to automatically call User.fromJSON on the resulting value.
  // tslint:disable-next-line
  static reviver(key: string, value: any): any {
    return key === '' ? ConversationalActionResponse.fromJSON(value) : value;
  }
}
