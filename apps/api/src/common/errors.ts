import type { ErrorRequestHandler } from 'express';
export class HttpError extends Error { constructor(public status:number, message:string){ super(message); } }
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => { const status = err instanceof HttpError ? err.status : 500; res.status(status).json({ error: status === 500 ? 'Internal server error' : err.message }); };
