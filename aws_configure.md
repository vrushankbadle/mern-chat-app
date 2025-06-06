### EC2 Instance

- select ubuntu
- download key-pair
- allow ssh (my ip), http, https traffic

###### Connect to Instance

- chmod 400 "path-to-key-pair"
- sudo ssh -i "path-to-key-pair" ubuntu@"instance-public-dns"

### App Setup

- install node.js
- sudo rsync -avz --exclude 'node_modules' --exclude '.git' -e "ssh -i path-to-key-pair" "path-to-project" ubuntu@"instance-public-dns":"end-dir"
- install mongodb

### Server Setup

- sudo vim /etc/systemd/system/myapp.service

[Unit]
Description=Node.js App
After=network.target multi-user.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/app
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production
EnvironmentFile=/etc/app.env
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=myapp

[Install]
WantedBy=multi-user.target

- sudo systemctl daemon-reload
  sudo systemctl enable myapp.service
  sudo systemctl start myapp.service

- enable will auto start the server using myapp.service configuration

- install nginx
- sudo vim /etc/nginx/sites-available/myapp

server {
listen 80;
server_name instance-ip-address;

    location / {
        proxy_pass http://localhost:port/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

}

- sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
- sudo systemctl start nginx
- sudo systemctl enable nginx
