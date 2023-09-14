import 'reflect-metadata';

import { MongoRepository, PayonPC } from '@/server/providers';
import { ItemService } from '@/server/services';
import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

const DEFAULT_BATCH_SIZE = 50;

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  // init service
  const payonPC = new PayonPC();
  const connection = await MongoClient.connect(process.env.MONGO_URL!);
  const mongoRepo = new MongoRepository(connection.db('ragnanalytics'));
  const itemService = new ItemService(mongoRepo, payonPC);

  // refresh history
  const today = new Date();
  const offset = today.getMinutes() * DEFAULT_BATCH_SIZE;

  let message: any = 'success';
  try {
    const result = await itemService.refreshVendingItems({
      take: DEFAULT_BATCH_SIZE,
      offset,
    });
    if (result) message = result;
  } catch (err: any) {
    message = err.message;
  }

  response.status(200).json({
    message,
  });
}
