import {Title} from "./Title";

export async function mal2anilibria(myAnimeListId: number)
{
  let dbResponse = await fetch(`https://raw.githubusercontent.com/qt-kaneko/MALibria/db/mapped.json`);
  let dbText = await dbResponse.text();
  let db = <Title[]>JSON.parse(dbText);

  return db.find(title => title.myanimelist_id === myAnimeListId)?.anilibria_id;
}