#! /bin/bash

set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

apt update
apt install -y linux-headers-$(uname -r) \
               apt-transport-https \
               ca-certificates \
               curl \
               gnupg-agent \
               software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository \
  "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) \
  stable"
apt update
apt install docker-ce docker-ce-cli containerd.io -y

curl -L "https://github.com/docker/compose/releases/download/1.25.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

mkdir -p /root/wg/config

cat <<EOF > docker-compose.yml
---
version: "2.1"
services:
  wireguard:
    image: linuxserver/wireguard
    container_name: wireguard
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Europe/Moscow
      - SERVERURL=auto
      - SERVERPORT=51820 #optional
      - PEERS=1
      - PEERDNS=auto
      - INTERNAL_SUBNET=10.13.13.0
    volumes:
      - /root/wg/config:/config
      - /lib/modules:/lib/modules
    ports:
      - 51820:51820/udp
#    sysctls:
#      - net.ipv4.conf.all.src_valid_mark=1
    restart: unless-stopped

EOF

docker-compose up -d
