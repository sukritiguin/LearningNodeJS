/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Response, Request } from "express"

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    res.json({
        "message": "User created successfully"
    })
}

export {createUser};