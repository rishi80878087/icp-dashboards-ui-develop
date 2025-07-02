import path from 'path';
import { promises as fs } from 'fs';
import getConfig from 'next/config'

const { serverRuntimeConfig } = getConfig()


export default async function handler(req, res) {
  // Set the response status code to 200 (OK)
  const { INTL_FILES_PATH } = serverRuntimeConfig;
  const translationsDir = INTL_FILES_PATH ? `${INTL_FILES_PATH}en.json` : path.join(__dirname, '../../../../intl/en.json');
  const en = await fs.readFile(translationsDir, "utf-8");
  const parsed = JSON.parse(en);
  // Construct the path to the specific locale file
  res.status(200).json({
    ...parsed
  });
}