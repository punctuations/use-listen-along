# 👥🎵 use-listen along
#### Typescript React Hook for listening along on spotify.

### 📦 Installation

---

via NPM
> npm i --save use-listen-along

via yarn 
> yarn add use-listen-along

### ⌨️ Usage

----

```tsx
import { useListenAlong } from 'use-listen-along';

const Spotify = () => {
  const [connection, setConnection] = React.useState<boolean>(false);
  
  // The discord ID of the user you wish to listen-along to.
  const snowflake = 291050399509774340;
  // The spotify authorization code.
  let auth_code: string;
  
	function listen(disconnect: boolean) {
	  // Get auth from spotify with scope 'user-modify-playback-state user-read-currently-playing'.
	  
	  const {connected, error} = useListenAlong(snowflake, auth_code, disconnect);
	  setConnection(connected);
	}

return (
  <button onClick={() => listen(connection)}> {connection ? 'Disconnect' : "Listen Along"} </button>
)
}
```

### Demo

You can find a demo on my [portfolio](https://dont-ping.me) (if im listening to spotify) :)

### Contributors

- [Conrad](https://github.com/cnrad)

- [Cole](https://github.com/monkeygamer11)

