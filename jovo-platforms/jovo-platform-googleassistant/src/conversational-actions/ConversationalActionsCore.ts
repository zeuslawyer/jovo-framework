import { Plugin, HandleRequest, EnumRequestType } from 'jovo-core';
import _set = require('lodash.set');
import _get = require('lodash.get');
import _unionWith = require('lodash.unionwith');

import { GoogleAssistant } from '../GoogleAssistant';
import { GoogleActionSpeechBuilder } from '../core/GoogleActionSpeechBuilder';

import { ConversationalAction } from './core/ConversationalAction';
import { ConversationalActionRequest } from './core/ConversationalActionRequest';
import { ConversationalActionResponse } from './core/ConversationalActionResponse';
import { Card, Image, Simple, Table, User } from './core/Interfaces';
import { ConversationalActionUser } from './core/ConversationalActionUser';
import { EnumGoogleAssistantRequestType } from '../core/google-assistant-enums';
import { GoogleAction } from '../core/GoogleAction';
import { BasicCard } from '..';

export class ConversationalActionsCore implements Plugin {
  install(googleAssistant: GoogleAssistant) {
    googleAssistant.middleware('$init')!.use(this.init.bind(this));
    googleAssistant.middleware('$type')!.use(this.type.bind(this));
    googleAssistant.middleware('$nlu')!.use(this.nlu.bind(this));
    googleAssistant.middleware('$inputs')!.use(this.inputs.bind(this));
    // googleAssistant.middleware('after.$type')!.use(this.userStorageGet.bind(this));
    googleAssistant.middleware('$session')!.use(this.session.bind(this));
    googleAssistant.middleware('$output')!.use(this.output.bind(this));
    // googleAssistant.middleware('after.$output')!.use(this.userStorageStore.bind(this));

    // ConversationalAction.prototype.addFirstSimple = function (firstSimple: Simple) {
    //   _set(this.$output, 'GoogleAssistant.firstSimple', firstSimple);
    //   return this;
    // };
    // ConversationalAction.prototype.addLastSimple = function (lastSimple: Simple) {
    //   _set(this.$output, 'GoogleAssistant.lastSimple', lastSimple);
    //   return this;
    // };
    //
    // ConversationalAction.prototype.addBasicCard = function (basicCard: Card) {
    //   _set(this.$output, 'GoogleAssistant.card', basicCard);
    //   return this;
    // };
    //
    // ConversationalAction.prototype.addImageCard = function (imageCard: Image) {
    //   _set(this.$output, 'GoogleAssistant.image', imageCard);
    //   return this;
    // };
    //
    // ConversationalAction.prototype.addTableCard = function (tableCard: Table) {
    //   _set(this.$output, 'GoogleAssistant.table', tableCard);
    //   return this;
    // };
  }

  async init(handleRequest: HandleRequest) {
    const requestObject = handleRequest.host.$request;
    /**
     * placeholder, since GoogleAction can't be run without dialogflow currently.
     * Platform object creation is therefore handled by dialogflow integration.
     */
    if (
      requestObject.user &&
      requestObject.session &&
      requestObject.handler &&
      requestObject.device
    ) {
      handleRequest.jovo = new ConversationalAction(
        handleRequest.app,
        handleRequest.host,
        handleRequest,
      );
    }
  }

  type(conversationalAction: ConversationalAction) {
    const request = conversationalAction.$request as ConversationalActionRequest;
    if (
      !request.session?.params._JOVO_SESSION_ &&
      request.scene?.name === 'actions.scene.START_CONVERSATION'
    ) {
      conversationalAction.$type = {
        type: EnumRequestType.LAUNCH,
      };
    } else if (request.intent?.name === 'actions.intent.CANCEL') {
      conversationalAction.$type = {
        type: EnumRequestType.END,
      };
    } else if (request.intent?.name) {
      conversationalAction.$type = {
        type: EnumRequestType.INTENT,
      };
    }

    if (request.intent?.name === 'actions.intent.NO_INPUT_1') {
      if (conversationalAction.$config.handlers[EnumGoogleAssistantRequestType.ON_NOINPUT1]) {
        conversationalAction.$type = {
          type: EnumGoogleAssistantRequestType.ON_NOINPUT1,
        };
      } else {
        const noinput1 = _get(request, 'session.params._JOVO_SESSION_.reprompts.NO_INPUT1');
        if (noinput1) {
          conversationalAction.ask(noinput1, noinput1); //TODO: find better solution
          conversationalAction.$type = {
            type: EnumGoogleAssistantRequestType.ON_NOINPUT1,
          };
        } else {
          conversationalAction.$type = {
            type: EnumRequestType.END,
          };
        }

        conversationalAction.$handleRequest!.excludedMiddlewareNames = [
          'platform.nlu',
          'asr',
          'platform.nlu',
          'nlu',
          'user.load',
          'asr',
          'handler',
          'user.save',
          'tts',
        ];
      }
    }

    if (request.intent?.name === 'actions.intent.NO_INPUT_2') {
      if (conversationalAction.$config.handlers[EnumGoogleAssistantRequestType.ON_NOINPUT2]) {
        conversationalAction.$type = {
          type: EnumGoogleAssistantRequestType.ON_NOINPUT2,
        };
      } else {
        const noinput2 = _get(request, 'session.params._JOVO_SESSION_.reprompts.NO_INPUT2');
        if (noinput2) {
          conversationalAction.ask(noinput2, noinput2); //TODO: find better solution
          conversationalAction.$type = {
            type: EnumGoogleAssistantRequestType.ON_NOINPUT2,
          };
        } else {
          conversationalAction.$type = {
            type: EnumRequestType.END,
          };
        }

        conversationalAction.$handleRequest!.excludedMiddlewareNames = [
          'platform.nlu',
          'asr',
          'platform.nlu',
          'nlu',
          'user.load',
          'asr',
          'handler',
          'user.save',
          'tts',
        ];
      }
    }

    if (request.intent?.name === 'actions.intent.NO_INPUT_FINAL') {
      if (conversationalAction.$config.handlers[EnumGoogleAssistantRequestType.ON_NOINPUTFINAL]) {
        conversationalAction.$type = {
          type: EnumGoogleAssistantRequestType.ON_NOINPUT2,
        };
      } else {
        const noinputfinal = _get(request, 'session.params._JOVO_SESSION_.reprompts.NO_INPUTFINAL');
        if (noinputfinal) {
          conversationalAction.ask(noinputfinal, noinputfinal); //TODO: find better solution
          conversationalAction.$type = {
            type: EnumGoogleAssistantRequestType.ON_NOINPUTFINAL,
          };
        } else {
          conversationalAction.$type = {
            type: EnumRequestType.END,
          };
        }

        conversationalAction.$handleRequest!.excludedMiddlewareNames = [
          'platform.nlu',
          'asr',
          'platform.nlu',
          'nlu',
          'user.load',
          'asr',
          'handler',
          'user.save',
          'tts',
        ];
      }
    }

    // if (
    //   _get(googleAction.$originalRequest || googleAction.$request, 'inputs[0].intent') ===
    //   'actions.intent.CANCEL'
    // ) {
    //   _set(googleAction.$type, 'type', EnumRequestType.END);
    // }
    // if (
    //   _get(
    //     googleAction.$originalRequest || googleAction.$request,
    //     'inputs[0].arguments[0].name',
    //   ) === 'is_health_check' &&
    //   _get(
    //     googleAction.$originalRequest || googleAction.$request,
    //     'inputs[0].arguments[0].boolValue',
    //   ) === true &&
    //   googleAction.$app.config.handlers.ON_HEALTH_CHECK
    // ) {
    //   _set(googleAction.$type, 'type', EnumGoogleAssistantRequestType.ON_HEALTH_CHECK);
    //   _set(googleAction.$type, 'optional', true);
    // }
  }

  async nlu(conversationalAction: ConversationalAction) {
    const request = conversationalAction.$request as ConversationalActionRequest;

    if (
      request.getIntentName() &&
      conversationalAction.$type &&
      conversationalAction.$type.type === EnumRequestType.INTENT
    ) {
      conversationalAction.$nlu = {
        intent: {
          name: request.getIntentName()!,
        },
      };
    }
  }

  async inputs(conversationalAction: ConversationalAction) {
    const request = conversationalAction.$request as ConversationalActionRequest;

    conversationalAction.$inputs = request.getInputs();
  }

  async session(conversationalAction: ConversationalAction) {
    const request = conversationalAction.$request as ConversationalActionRequest;

    conversationalAction.$session.$data = {
      ...request.session?.params,
    };

    if (!conversationalAction.$session.$data._JOVO_SESSION_?.new) {
      conversationalAction.$conversationalSession = {
        createdAt: new Date().toISOString(),
        new: true,
      };
    } else {
      conversationalAction.$conversationalSession = {
        ...conversationalAction.$session.$data._JOVO_SESSION_,
        new: false,
      };
      conversationalAction.$session.$data._JOVO_SESSION_.new = false;
    }
  }

  async output(conversationalAction: ConversationalAction) {
    const output = conversationalAction.$output;
    const request = conversationalAction.$request as ConversationalActionRequest;

    const response = conversationalAction.$response as ConversationalActionResponse;
    console.log(output);

    const tell = output?.GoogleAssistant?.tell || output?.tell;
    _set(conversationalAction.$response as ConversationalActionResponse, 'scene.next.name', '');
    if (tell) {
      _set(
        conversationalAction.$response as ConversationalActionResponse,
        'prompt.firstSimple.speech',
        GoogleActionSpeechBuilder.toSSML(tell.speech as string),
      );
      _set(
        conversationalAction.$response as ConversationalActionResponse,
        'scene.next.name',
        'actions.scene.END_CONVERSATION',
      );
    }

    const ask = output?.GoogleAssistant?.ask || output?.ask;
    console.log();
    console.log(ask);
    console.log();

    if (ask) {
      _set(
        conversationalAction.$response as ConversationalActionResponse,
        'prompt.firstSimple.speech',
        GoogleActionSpeechBuilder.toSSML(ask.speech as string),
      );

      if (!conversationalAction.$conversationalSession.reprompts) {
        let input1, input2, final;

        if (Array.isArray(ask.reprompt) && ask.reprompt[0]) {
          input1 = ask.reprompt[0];
        } else if (typeof ask.reprompt === 'string') {
          input1 = ask.reprompt;
        }

        if (Array.isArray(ask.reprompt) && ask.reprompt[1]) {
          input2 = ask.reprompt[1];
        } else if (typeof ask.reprompt === 'string') {
          input2 = ask.reprompt;
        }

        if (Array.isArray(ask.reprompt) && ask.reprompt[2]) {
          final = ask.reprompt[2];
        } else if (typeof ask.reprompt === 'string') {
          final = ask.reprompt;
        }

        conversationalAction.$conversationalSession.reprompts = {
          NO_INPUT1: input1,
          NO_INPUT2: input2,
          NO_INPUTFINAL: final,
        };
      }
    }

    // if (tell) {
    //   _set(googleAction.$originalResponse, 'expectUserResponse', false);
    //   _set(googleAction.$originalResponse, 'richResponse.items', [
    //     {
    //       simpleResponse: {
    //         ssml: GoogleActionSpeechBuilder.toSSML(tell.speech),
    //       },
    //     },
    //   ]);
    // }
    // const ask = _get(output, 'GoogleAssistant.ask') || _get(output, 'ask');
    //
    // if (ask) {
    //   _set(googleAction.$originalResponse, 'expectUserResponse', true);
    //
    //   // speech
    //   _set(googleAction.$originalResponse, 'richResponse.items', [
    //     {
    //       simpleResponse: {
    //         ssml: GoogleActionSpeechBuilder.toSSML(ask.speech),
    //       },
    //     },
    //   ]);
    //
    //   // reprompts
    //   const noInputPrompts: any[] = []; // tslint:disable-line
    //
    //   if (output.ask && output.ask.reprompt && typeof output.ask.reprompt === 'string') {
    //     noInputPrompts.push({
    //       ssml: GoogleActionSpeechBuilder.toSSML(ask.reprompt),
    //     });
    //   } else if (Array.isArray(ask.reprompt)) {
    //     ask.reprompt.forEach((reprompt: string) => {
    //       noInputPrompts.push({
    //         ssml: GoogleActionSpeechBuilder.toSSML(reprompt),
    //       });
    //     });
    //   }
    //   _set(googleAction.$originalResponse, 'noInputPrompts', noInputPrompts);
    // }
    //
    // if (_get(output, 'GoogleAssistant.displayText') && googleAction.hasScreenInterface()) {
    //   _set(
    //     googleAction.$originalResponse,
    //     'richResponse.items[0].simpleResponse.displayText',
    //     _get(output, 'GoogleAssistant.displayText'),
    //   );
    // }
    //
    // if (output.GoogleAssistant && output.GoogleAssistant.RichResponse) {
    //   _set(googleAction.$originalResponse, 'richResponse', output.GoogleAssistant.RichResponse);
    // }
    //
    // if (output.GoogleAssistant && output.GoogleAssistant.ResponseAppender) {
    //   let responseItems = _get(googleAction.$originalResponse, 'richResponse.items', []);
    //   responseItems = responseItems.concat(output.GoogleAssistant.ResponseAppender);
    //   _set(googleAction.$originalResponse, 'richResponse.items', responseItems);
    // }
    //
    // if (output.GoogleAssistant && output.GoogleAssistant.SessionEntityTypes) {
    //   const responseItems = output.GoogleAssistant.SessionEntityTypes;
    //   _set(googleAction.$originalResponse, 'sessionEntityTypes', responseItems);
    // }

    response.user = {
      params: {
        ...(conversationalAction.$user as ConversationalActionUser).$params,
      },
    } as User;

    response.session = {
      id: request.session?.id!,
      params: {
        _JOVO_SESSION_: conversationalAction.$conversationalSession,
        ...conversationalAction.$session.$data,
      },
    };
  }
  uninstall(googleAssistant: GoogleAssistant) {}
}
