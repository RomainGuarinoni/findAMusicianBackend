import express from 'express';
import pg from '../../postgres';
import { v4 as uuidV4 } from 'uuid';
import sql from 'sql-template-strings';
import type { operations, components } from '@schema';
import type {
  getHTTPCode,
  getResponsesBody,
  getRequestBody,
  getPathParams,
} from '@typing';
import type core from 'express-serve-static-core';

const router = express.Router();

type GetEvents = operations['getEvents'];
type PostEvents = operations['postEvents'];
type GetEventsById = operations['getEventById'];
type PatchEventsById = operations['patchEventById'];
type DeleteEventsById = operations['deleteEventById'];

router.get(
  '/',
  async (
    req: core.Request<
      {},
      getResponsesBody<GetEvents>,
      getRequestBody<GetEvents>,
      getPathParams<GetEvents>
    >,
    res: core.Response<getResponsesBody<GetEvents>, {}, getHTTPCode<GetEvents>>,
  ) => {
    try {
      const { rows }: { rows: getResponsesBody<GetEvents> } =
        await pg.query(sql`
            SELECT * FROM events
        `);
      for (let index = 0; index < rows.length; index++) {
        const { rows: admin } = await pg.query<
          components['schemas']['musician']
        >(sql`
            SELECT * FROM musicians
            INNER JOIN events_admin
            ON events_admin.admin = musicians.id
            WHERE events_admin.event = ${rows[index].id}
          `);
        rows[index]['admin'] = admin[0];
      }
      return res.status(200).json(rows);
    } catch (err) {
      return res
        .status(500)
        .json({ msg: 'E_SQL_ERROR', stack: JSON.stringify(err) });
    }
  },
);

router.post(
  '/',
  async (
    req: core.Request<
      {},
      getResponsesBody<PostEvents>,
      getRequestBody<PostEvents>,
      getPathParams<PostEvents>
    >,
    res: core.Response<
      getResponsesBody<PostEvents>,
      {},
      getHTTPCode<PostEvents>
    >,
  ) => {
    try {
      const id = uuidV4();
      await pg.query(sql`
              INSERT INTO events (
                  id,
                  name,
                  description,
                  start_date,
                  end_date,
                  adress
              ) VALUES (
                  ${id},
                  ${req.body.name},
                  ${req.body.description},
                  ${req.body.start_date},
                  ${req.body.end_date},
                  ${req.body.adress}
              );
          `);
      await pg.query(sql`
        INSERT INTO events_admin (
            event,
            admin
        ) VALUES (
            ${id},
            ${req.userId}
        );
    `);
      res.sendStatus(201);
    } catch (err) {
      if (err.constraint === 'events_name_key') {
        return res.status(401).json({ msg: 'E_EVENT_NAME_ALREADY_TAKEN' });
      } else {
        return res
          .status(500)
          .json({ msg: 'E_SQL_ERR', stack: JSON.stringify(err) });
      }
    }
  },
);

router.get(
  '/:eventId',
  async (
    req: core.Request<
      getPathParams<GetEventsById>,
      getResponsesBody<GetEventsById>,
      getRequestBody<GetEventsById>,
      getPathParams<GetEventsById>
    >,
    res: core.Response<
      getResponsesBody<GetEventsById>,
      {},
      getHTTPCode<GetEventsById>
    >,
  ) => {
    try {
      const { rows } = await pg.query(sql`
        SELECT * FROM events
        WHERE id = ${req.params.eventId}
      `);

      if (rows.length === 0) {
        return res.status(404).json({ msg: 'E_EVENT_DOES_NOT_EXIST' });
      }

      const { rows: admin } = await pg.query(sql`
            SELECT * FROM musicians
            INNER JOIN events_admin
            ON events_admin.admin = musicians.id
            WHERE events_admin.event = ${req.params.eventId}
          `);

      rows[0]['admin'] = admin[0];

      return res.status(200).json(rows);
    } catch (err) {
      return res
        .status(500)
        .json({ msg: 'E_SQL_ERROR', stack: JSON.stringify(err) });
    }
  },
);

router.patch(
  '/:eventId',
  async (
    req: core.Request<
      getPathParams<PatchEventsById>,
      getResponsesBody<PatchEventsById>,
      getRequestBody<PatchEventsById>,
      getPathParams<PatchEventsById>
    >,
    res: core.Response<
      getResponsesBody<PatchEventsById>,
      {},
      getHTTPCode<PatchEventsById>
    >,
  ) => {
    try {
      const { rows } = await pg.query(sql`
          SELECT admin
          FROM events_admin
          WHERE event = ${req.params.eventId}
        `);

      if (rows.length == 0) {
        return res.status(404).json({ msg: 'E_EVENT_DOES_NOT_EXIST' });
      }

      if (rows.some(({ admin }) => admin === req.userId)) {
        pg.query(sql`
            UPDATE events
            SET
              name = ${req.body.name} ,
              description= ${req.body.description}  ,
              start_date= ${req.body.start_date}  ,
              end_date = ${req.body.end_date} ,
              adress = ${req.body.adress}
            WHERE id = ${req.params.eventId}
          `);

        return res.sendStatus(200);
      } else {
        return res.status(403).json({ msg: 'E_UNAUTHORIZED_USER' });
      }
    } catch (err) {
      console.log(err);

      return res
        .status(500)
        .json({ msg: 'E_SQL_ERROR', stack: JSON.stringify(err) });
    }
  },
);

router.delete(
  '/:eventId',
  async (
    req: core.Request<
      getPathParams<DeleteEventsById>,
      getResponsesBody<DeleteEventsById>,
      getRequestBody<DeleteEventsById>,
      getPathParams<DeleteEventsById>
    >,
    res: core.Response<
      getResponsesBody<DeleteEventsById>,
      {},
      getHTTPCode<DeleteEventsById>
    >,
  ) => {
    try {
      const { rows: admin } = await pg.query(sql`
                SELECT admin
                FROM events_admin
                WHERE event = ${req.params.eventId}
            `);
      if (admin.length === 0) {
        return res.status(404).json({ msg: 'E_EVENT_DOES_NOT_EXIST' });
      } else {
        if (admin.some(({ admin }) => admin === req.userId)) {
          await pg.query(sql`
                  DELETE FROM events WHERE events.id = ${req.params.eventId}
                `);

          return res.sendStatus(200);
        } else {
          return res.status(403).json({ msg: 'E_UNAUTHORIZED_USER' });
        }
      }
    } catch (err) {
      return res
        .status(500)
        .json({ msg: 'E_SQL_ERROR', stack: JSON.stringify(err) });
    }
  },
);

export default router;