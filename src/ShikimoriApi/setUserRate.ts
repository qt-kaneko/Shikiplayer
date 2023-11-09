namespace ShikimoriApi
{
  export async function setUserRate(animeId: number, userId: number, userRate: UserRate)
  {
    let body = new URLSearchParams({
      [`user_rate[user_id]`]: userId.toString(),
      [`user_rate[target_id]`]: animeId.toString(),
      [`user_rate[target_type]`]:	`Anime`,
      [`user_rate[status]`]: userRate.status,
      [`user_rate[episodes]`]: userRate.episodes.toString(),
    });
    if (userRate.text != null) body.set(`user_rate[text]`, userRate.text);

    await fetch(`https://${location.hostname}/api/v2/user_rates`, {
      method: `POST`,
      body
    });
  }
}