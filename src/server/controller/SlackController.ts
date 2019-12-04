import { WebClient } from '@slack/web-api';
import debug from 'debug';
import { Request } from 'express';

import { ISlackResponse } from '../../models/slack/interface/ISlackResponse';
import { Util } from '../../services/util';
import { TControllerResp } from './ICommonController';

const log = debug('trv:SlackController');

export class SlackController {
  public async sendQueueMessageToUser(
    req: Request
  ): Promise<TControllerResp<ISlackResponse>> {
    const { channel, text } = req.query;

    if (Util.isEmpty(channel) || Util.isEmpty(text)) {
      return {
        status: 400,
        payload: {
          ok: false,
          error_message: '필수 요청값이 없음'
        }
      };
    }

    // 슬랙 메시지 보내자.
    const token: string = process.env.SLACK_TOKEN
      ? process.env.SLACK_TOKEN.toLowerCase()
      : '';
    log(token);
    if (Util.isEmpty(token)) {
      return {
        status: 500,
        payload: {
          ok: false,
          error_message: 'slack 설정 오류'
        }
      };
    }

    const bot = new WebClient(token);

    const resp = await bot.chat.postMessage({
      channel,
      text,
      token,
      icon_url: 'https://media.alienwarearena.com/media/NQWR3vA.jpg',
      username: '저기요'
    });

    log(resp);

    return {
      status: resp.ok === true ? 200 : 400,
      payload: {
        ...resp
      }
    };
  }
}
