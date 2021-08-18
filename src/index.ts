import { LanyardResponse } from './types';

/**
 * use-listen-along
 * @param snowflake The discord snowflake of the user you wish to listen-along to.
 * @param auth The spotify auth code, required to have 'user-modify-playback-state' as a scope.
 * @param disconnect A boolean value that can be passed into the function to disconnect a user.
 */
export function useListenAlong(
  snowflake: string,
  auth: string,
  disconnect?: boolean,
) {
  let track: string | undefined;

  let connected: boolean = false;
  let error: string | null = null;

  const parseResponse = (res: LanyardResponse) => {
    const error = { status: !res.success, message: res?.error?.message };
    const np = res.data?.listening_to_spotify;
    const track = res.data?.spotify?.track_id;

    return {
      error,
      np,
      track,
    };
  };

  const setResponse = (r: {
    error: { status: boolean; message: string };
    np: boolean | undefined;
    track: string | undefined;
  }) => {
    if (r.error.status) throw new Error(JSON.stringify(r.error));

    if (r.track !== track && r.np && !disconnect) {
      fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${auth}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          uris: [`spotify:track:${track}`],
        }),
      })
        .then((r) => {
          connected = r.status == 204;
          error =
            r.status !== 204
              ? r.status == 403
                ? 'User must have a premium account.'
                : r.statusText
              : null;
        })
        .catch((e) => {
          if (e.status) throw new Error(e);
        });
    }

    track = r.track;
  };

  setInterval(() => {
    if (!disconnect) {
      fetch(`https://api.lanyard.rest/v1/users/${snowflake}`)
        .then((r) => r.json())
        .then(parseResponse)
        .then(setResponse);
    }
  }, 1000);

  return { connected, error };
}
