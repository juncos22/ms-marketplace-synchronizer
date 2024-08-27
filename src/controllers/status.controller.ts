import { NextFunction, Request, Response } from 'express';

export default class StatusController {
  static async statusServer(_req: Request, res: Response, _next: NextFunction) {
    res
      .status(200)
      .json({ succes: true, response: null, error: null, stack: null });
  }
}
