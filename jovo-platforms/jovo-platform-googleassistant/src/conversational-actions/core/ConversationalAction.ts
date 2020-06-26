import { AudioData, BaseApp, HandleRequest, Host, Jovo, SpeechBuilder } from 'jovo-core';
import { DialogflowRequest } from 'jovo-platform-dialogflow';
import _get = require('lodash.get');
import { ConversationalActionRequest } from './ConversationalActionRequest';
import { Capability } from './Interfaces';
import { GoogleActionUser } from '../../core/GoogleActionUser';
import { GoogleActionSpeechBuilder } from '../..';
import { ConversationalActionUser } from './ConversationalActionUser';
import { ConversationalActionResponse } from './ConversationalActionResponse';

const _sample = require('lodash.sample');

type reprompt = string | SpeechBuilder;

export interface ConversationalSession {
  new?: boolean;
  createdAt?: string;
  reprompts?: any;
}

export class ConversationalAction extends Jovo {
  $user: ConversationalActionUser;

  $conversationalSession: ConversationalSession = {};

  constructor(app: BaseApp, host: Host, handleRequest?: HandleRequest) {
    super(app, host, handleRequest);
    this.$conversationalAction = this;
    // this.platformRequest = platformRequest;
    this.$speech = new GoogleActionSpeechBuilder(this);
    this.$reprompt = new GoogleActionSpeechBuilder(this);

    this.$request = ConversationalActionRequest.fromJSON(
      this.$host.getRequestObject(),
    ) as ConversationalActionRequest;
    this.$response = new ConversationalActionResponse();
    this.$user = new ConversationalActionUser(this);
  }

  /**
   * Returns locale of the request
   * @deprecated use this.$request.getLocale() instead
   * @return {string}
   */
  getLocale(): string {
    console.log(this.$request!.getLocale());
    return this.$request!.getLocale();
  }

  /**
   * Returns timestamp of a user's request
   * @return {string | undefined}
   */
  getTimestamp() {
    return this.$request!.getTimestamp();
  }

  /**
   * Returns Speechbuilder object initialized for the platform
   * @public
   * @return {SpeechBuilder}
   */
  speechBuilder(): GoogleActionSpeechBuilder {
    return this.getSpeechBuilder();
  }

  /**
   * Returns Speechbuilder object initialized for the platform
   * @public
   * @return {SpeechBuilder}
   */
  getSpeechBuilder(): GoogleActionSpeechBuilder {
    return new GoogleActionSpeechBuilder(this);
  }

  /**
   * Returns boolean if request is part of new session
   * @public
   * @return {boolean}
   */
  isNewSession(): boolean {
    return this.$request!.isNewSession();
  }

  /**
   * Says speech and waits for answer from user.
   * Reprompt when user input fails.
   * Keeps session open.
   * @public
   * @param {string|SpeechBuilder} speech
   * @param {string|SpeechBuilder|Array<SpeechBuilder>|Array<string>} reprompt
   * @param {reprompt[]} reprompts additional reprompts
   */
  ask(
    speech: string | SpeechBuilder | string[],
    reprompt: string | SpeechBuilder | string[],
    ...reprompts: reprompt[]
  ) {
    delete this.$output.tell;

    if (Array.isArray(speech)) {
      speech = _sample(speech);
    }

    if (Array.isArray(reprompt)) {
      reprompt = _sample(reprompt);
    }

    if (!reprompt) {
      reprompt = speech;
    }

    this.$output.ask = {
      speech: speech.toString(),
      reprompt: reprompt.toString(),
    };

    if (reprompts) {
      this.$output.ask.reprompt = [reprompt.toString()];
      reprompts.forEach((repr: string | SpeechBuilder) => {
        (this.$output.ask!.reprompt as string[]).push(repr.toString());
      });
    }

    return this;
  }

  /**
   * Returns web browser capability of request device
   * @public
   * @return {boolean}
   */
  hasWebBrowserInterface(): boolean {
    return (this.$request! as ConversationalActionRequest).hasWebBrowserInterface();
  }

  /**
   * Returns screen capability of request device
   * @public
   * @return {boolean}
   */
  hasScreenInterface() {
    return (this.$request! as ConversationalActionRequest).hasScreenInterface();
  }

  /**
   * Returns audio capability of request device
   * @public
   * @return {boolean}
   */
  hasAudioInterface() {
    return (this.$request! as ConversationalActionRequest).hasAudioInterface();
  }

  hasLongFormAudioInterface() {
    const request = this.$request! as ConversationalActionRequest;
    if (request.device) {
      return !!request.device.capabilities.find((cap: Capability) => cap === 'LONG_FORM_AUDIO');
    }
  }

  /**
   * Returns interactive canvas capability of request device
   * @public
   * @return {boolean}
   */
  hasInteractiveCanvasInterface() {
    const request = this.$request! as ConversationalActionRequest;
    if (request.device) {
      return !!request.device.capabilities.find((cap: Capability) => cap === 'INTERACTIVE_CANVAS');
    }
  }

  /**
   * Returns array of availiable surfaces
   * @return {Array<string>}
   */
  getAvailableSurfaces() {
    // TODO:
  }

  /**
   * Returns video capability of request device
   * @public
   * @return {boolean}
   */
  hasVideoInterface() {
    return false;
  }

  /**
   * Google Assistant doesn't return a device id
   * @return {string | undefined}
   */
  getDeviceId() {
    return undefined;
  }

  /**
   * Returns type of platform ("AlexaSkill","GoogleAction")
   * @public
   * @return {string}
   */
  getType() {
    return 'ConversationalAction';
  }

  /**
   * Returns type of platform type
   * @public
   * @return {string}
   */
  getPlatformType() {
    return 'GoogleAssistant';
  }

  /**
   * Returns raw text of request.
   * @return {string | undefined}
   */
  getRawText() {
    const request = this.$request! as ConversationalActionRequest;
    return request.intent?.query;
  }

  /**
   * Returns audio data of request.
   * Not supported by this platform.
   * @return {undefined}
   */
  getAudioData(): AudioData | undefined {
    return undefined;
  }

  isInSandbox() {
    // TODO:
  }

  /**
   * Returns user's verification status
   */
  isVerifiedUser(): boolean {
    const request = this.$request! as ConversationalActionRequest;

    return request.user?.verificationStatus === 'VERIFIED';
  }

  getSelectedElementId(): string | undefined {
    throw new Error('Method not implemented.');
  }

  /**
   * Returns the project id that is associated with this Google Action
   */
  getProjectId(): string {
    const queryParams = this.$host.getQueryParams();
    // TODO: pass projectID via query param?
    return queryParams['projectId'];
  }
}
