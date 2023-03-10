import type { NextApiRequest, NextApiResponse } from 'next';
import sanityClient from '@sanity/client';

export const config = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  apiVersion: '2021-03-25',

  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
};

const client = sanityClient(config);

const createComment = async (req: NextApiRequest, res: NextApiResponse) => {
  const { _id, name, email, comment } = JSON.parse(req.body);

  try {
    await client.create({
      _type: 'comment',
      post: {
        _type: 'reference',
        _ref: _id,
      },
      name,
      email,
      comment,
    });
  } catch (err) {
    return res.status(500).json({ message: `Couldn't submit comment`, err });
  }
  console.log('Comment is submited');
  res.status(200).json({ name: 'John Doe' });
};

export default createComment;
