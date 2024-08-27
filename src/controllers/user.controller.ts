import { NextFunction, Request, Response } from 'express';
import getUser from '../database/gets/user.get';
import { postNewUser } from '../database/post/user.post';
import { User } from '../utils/interfaces/user';

export default class UserController {
  static getUser = async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const user = await getUser(id);
    res
      .status(200)
      .json({ success: true, data: user, error: null, stack: null });
  };

  static postUser = async (
    req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    let newUser = req.body as User;
    const role: string = 'user';
    const status: boolean = true;
    newUser.role = role;
    newUser.status = status;

    const createUser = await postNewUser(newUser);
    res
      .status(200)
      .json({ success: true, data: createUser, error: null, stack: null });
  };
}
