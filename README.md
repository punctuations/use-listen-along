# 🌙 wrap-presence
#### An official wrapper for [presence](https://presence.im).

### 📦 Installation

---

via NPM
> npm i --save wrap-presence

via yarn 
> yarn add wrap-presence

### ⌨️ Usage

----

```tsx
import { wrapPresence } from 'wrap-presence';

const Presence = async () => {
	const req = {
		platform: 'twitter',
		type: 'user',
		params: 'atmattt',
	};
	
	const {data, error, isLoading} =  await wrapPresence(req);

	if (isLoading) {
		return <p>Loading...</p>
	} else if (error) {
		return <p>An error has occured!</p>
	}
	
	return data;
}
```

