# cousinsd.net

Kinda a shame that there are no install instrxuuctions.

I should change that.

Firstly 

```
npm install
```

Run:
```
npm run dev
```

## Nginx

Install fcgiwrap

```
sudo apt install fcgiwrap
```


Example nginx config.

```
server {
	listen 80;
	listen [::]:80;
	location / {
		try_files $uri $uri/ /index.html;
		index index.html;
		root /home/cousinsd/Web/cousinsd.net;

	}
	location ~* \.md {
		root /home/cousinsd/Web/cousinsd.net/src/sources/md;
		add_header 'Vary' 'Accept';
		if (!-f $request_filename) {
		  break;
		}
	}
	location ~* \.json {
		root /home/cousinsd/Web/cousinsd.net/src/sources/json;
		add_header 'Vary' 'Accept';
		if (!-f $request_filename) {
                  break;
                }
	}
	location ~* .(png|ico|gif|jpg|jpeg)$ {
		root /home/cousinsd/Web/cousinsd.net/src/images;
	}
	location ~* .mov {
		root /home/cousinsd/Web/cousinsd.net/src/videos;
	}
	location ~ ^/(@vite|src|node_modules)/ {
                set $my_port 3332;
		proxy_pass http://127.0.0.1:$my_port;
		proxy_http_version 1.1;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection 'upgrade';
		proxy_set_header Host $host;
		proxy_cache_bypass $http_upgrade;
		break;
	}
}

```
