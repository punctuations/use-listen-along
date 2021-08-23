import { LanyardResponse } from './types';
import dayjs from 'dayjs';

/**
 * use-listen-along
 * @param snowflake The discord snowflake of the user you wish to listen-along to.
 * @param auth The spotify auth code, required to have 'user-modify-playback-state user-read-currently-playing' as a scope.
 * @param disconnect A boolean value that can be passed into the function to disconnect a user.
 */
export function useListenAlong(
  snowflake: string,
  auth: string,
  disconnect?: boolean,
) {
  let track: string | undefined;
  let currently: string | undefined;
  let position: number | undefined;

  let connected: boolean = false;
  let error: string | null = null;

  const parseResponse = (res: LanyardResponse) => {
    const error = { status: !res.success, message: res?.error?.message };
    const np = res.data?.listening_to_spotify;
    const track = res.data?.spotify?.track_id;
    const end = res?.data?.spotify?.timestamps?.end;
    const start = res?.data?.spotify?.timestamps?.start;

    return {
      error,
      np,
      track,
      end,
      start,
    };
  };

  const currentlyPlaying = () => {
    fetch(
      'https://api.spotify.com/v1/me/player/currently-playing?market=from_token',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${auth}`,
        },
      },
    )
      .then((r) => r.json())
      .then((r) => {
        currently = r?.item?.id;
        position = r?.progress_ms;
      });
  };

  const setResponse = (r: {
    error: { status: boolean; message: string };
    np: boolean | undefined;
    track: string | undefined;
    end: number;
    start: number;
  }) => {
    if (r.error.status) throw new Error(JSON.stringify(r.error));

    currentlyPlaying();

    // if the track is different OR the song is behind by 15 seconds OR the song is ahead by 15 seconds
    if (
      (r.track &&
        currently &&
        r.track !== currently &&
        r.track !== track &&
        r.np &&
        !disconnect) ||
      (r.track &&
        r.np &&
        currently &&
        r.track == currently &&
        r.track == track &&
        position &&
        !disconnect &&
        (r.end - r.start - dayjs(r.end).diff(dayjs(), 'millisecond')) / 1000 -
          15 >
          position / 1000) ||
      (r.track &&
        r.np &&
        currently &&
        r.track == currently &&
        r.track == track &&
        position &&
        !disconnect &&
        (r.end - r.start - dayjs(r.end).diff(dayjs(), 'millisecond')) / 1000 +
          15 <
          position / 1000)
    ) {
      fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${auth}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          uris: [`spotify:track:${r.track}`],
          position_ms:
            // total ms
            r.end -
            r.start - // time left in the song
            dayjs(r.end).diff(dayjs(), 'millisecond'),
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

      track = r.track;
    }
  };

  setInterval(() => {
    if (!disconnect) {
      fetch(`https://api.lanyard.rest/v1/users/${snowflake}`)
        .then((r) => r.json())
        .then(parseResponse)
        .then(setResponse);
    }
  }, 1500);

  return { connected, error };
}
