import {User} from "./User";

export function getUserId()
{
  let userText = document.body.dataset[`user`]!;
  let user = <User>JSON.parse(userText);

  return user.id;
}