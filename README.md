# cousind.net

```
server {
	listen 80;
	listen [::]:80;
	location / {
		try_files $uri $uri/ /index.html;
    index index.html;
		root /home/cousinsd/Web/boxesapp/docs/dist;

		#proxy_pass http://127.0.0.1:$my_port;
		#proxy_http_version 1.1;
		#proxy_set_header Upgrade $http_upgrade;
		#proxy_set_header Connection 'upgrade';
		#proxy_set_header Host $host;
		#proxy_cache_bypass $http_upgrade;
	}
	location ~* \.md {
		root /home/cousinsd/Web/boxesapp/docs/src/sources/md;
		add_header 'Vary' 'Accept';
		if (!-f $request_filename) {
			break;
		}
	}
	location ~* \.json {
		root /home/cousinsd/Web/boxesapp/docs/src/sources/json;
		add_header 'Vary' 'Accept';
		if (!-f $request_filename) {
      break;
    }
	}
	location ~* .(png|ico|gif|jpg|jpeg)$ {
		root /home/cousinsd/Web/boxesapp/docs/src/images;
	}
	location ~* .mov {
		root /home/cousinsd/Web/boxesapp/docs/src/videos;
	}
	location ~ ^/(@vite|src|node_modules)/ {
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
